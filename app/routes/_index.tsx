import { useAction, useMutation } from "convex/react";
import { useRef, useState } from "react";

import { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { FileUp } from "lucide-react";
import HoaInfoDialog from "~/components/HoaInfoModal";
import RecentUploads from "~/components/RecentUploads";

export const meta: MetaFunction = () => {
	return [
		{ title: "HOA Lens" },
		{
			name: "description",
			content:
				"Upload HOA documents to get free AI-powered summaries and insights",
		},
	];
};

export default function Index() {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showHoaDialog, setShowHoaDialog] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const generateUploadUrl = useMutation(api.docs.generateUploadUrl);
	const saveDocument = useMutation(api.docs.saveDocument);
	const addHoa = useMutation(api.hoas.addHoa);
	const convertPdfToText = useAction(api.pdf.convertPdfToText);
	const convertPdfToTextGemini = useAction(api.pdf.convertPdfToTextGemini);

	const navigate = useNavigate();

	function handleClick() {
		document.getElementById("file-upload")?.click();
	}

	function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
		if (isUploading) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
	}

	function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
		if (isUploading) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);
	}

	function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
		if (isUploading) return;
		e.preventDefault();
		e.stopPropagation();
	}

	function handleDrop(e: React.DragEvent<HTMLDivElement>) {
		if (isUploading) return;
		e.preventDefault();
		e.stopPropagation();
		setIsDragging(false);

		const files = e.dataTransfer.files;
		if (files && files[0]) {
			handleFile(files[0]);
			setError(null);
		}
	}

	async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;
		if (files && files[0]) {
			handleFile(files[0]);
			setError(null);
		}
	}

	function handleFile(file: File) {
		if (file.type !== "application/pdf") {
			setError("Please upload a PDF file");
			return;
		}
		setSelectedFile(file);
		setShowHoaDialog(true);
	}

	async function processFileUpload(
		name: string,
		location: {
			city: string;
			state: string;
			zipcode: string;
		},
		docName: string
	) {
		try {
			if (!selectedFile || selectedFile.type !== "application/pdf") {
				throw new Error("Please upload a PDF file");
			}

			setIsUploading(true);
			setError(null);

			const postUrl = await generateUploadUrl();

			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": selectedFile.type },
				body: selectedFile,
			});

			if (!result.ok) {
				throw new Error("Failed to upload file");
			}

			const { storageId } = await result.json();
			if (!storageId) throw new Error("Failed to retrieve storage id");

			const extractedText = await convertPdfToTextGemini({ storageId });

			const hoaId = await addHoa({
				name: name,
				location: {
					city: location.city,
					state: location.state,
					zipcode: location.zipcode,
				},
			});

			const docId = await saveDocument({
				storageId,
				summary: "",
				transcript: extractedText ?? "",
				docName: docName,
				hoaId: hoaId,
			});

			navigate(`doc/${docId}`);
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Failed to parse document"
			);
			console.log(error);
		} finally {
			setIsUploading(false);
		}
	}

	function handleCancel() {
		setShowHoaDialog(false);
		setSelectedFile(null);
		if (fileInputRef?.current) fileInputRef.current.value = "";
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="text-center">
					{/* <h1 className="text-2xl font-bold tracking-tight text-gray-700 flex flex-row justify-center">
						HOA Lens
						<Search />
					</h1> */}
					<div>
						<p className="text-md font-black text-gray-600">
							AI-Powered
						</p>
						<p className="text-xl font-bold text-gray-700">
							Interactive HOA Documents
						</p>
						<p className="text-md text-gray-600">
							Search, Summarize, Chat
						</p>
					</div>
				</div>
				<div className="mt-10">
					<div
						onDragEnter={handleDragEnter}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						className={`mx-auto max-w-2xl rounded-lg border-4 sm:border-dashed p-12 text-center ${
							isDragging
								? "border-blue-500 bg-blue-50"
								: "border-gray-400"
						} transition-colors duration-200`}
					>
						<div className="flex flex-col items-center">
							<FileUp
								className={`h-12 w-12 ${
									isDragging
										? "text-blue-500"
										: "text-gray-400"
								}`}
							/>
							{!isUploading ? (
								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700">
										<button onClick={handleClick}>
											<span className="text-blue-600">
												Upload a file
											</span>
										</button>{" "}
										{
											<span className="hidden sm:inline">
												or drag and drop
											</span>
										}
									</label>

									<p className="mt-1 text-xs text-gray-500">
										PDF documents up to 100 pages
									</p>

									<input
										ref={fileInputRef}
										type="file"
										className="sr-only"
										accept=".pdf"
										onChange={handleFileSelect}
										id="file-upload"
										name="file-upload"
									/>

									<button
										onClick={handleClick}
										className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
										disabled={isUploading}
									>
										Choose file
									</button>
								</div>
							) : (
								<p className="mt-4">Loading...</p>
							)}
						</div>
					</div>
				</div>
				{error && <p className="text-red-500">{error}</p>}
				<HoaInfoDialog
					isOpen={showHoaDialog}
					onClose={handleCancel}
					onSubmit={processFileUpload}
				/>
				<RecentUploads />
			</div>
		</div>
	);
}
