import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import {
	ArrowLeft,
	File,
	FileText,
	MessageCircle,
	Search,
	Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Id } from "convex/_generated/dataModel";
import { ConvexHttpClient } from "convex/browser";
import { useQuery } from "convex/react";
import ChatView from "~/components/ChatView";
import PdfViewer from "~/components/PdfViewer";
import SearchView from "~/components/SearchView";
import Summary from "~/components/Summary";
import Transcript from "~/components/Transcript";
import { api } from "../../convex/_generated/api";

export async function loader({ params }: LoaderFunctionArgs) {
	const client = new ConvexHttpClient(process.env.CONVEX_URL!);

	try {
		const metadata = await client.query(api.docs.getDocumentMeta, {
			id: params.docId as Id<"docs">,
		});

		return metadata;
	} catch (error) {
		return null;
	}
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) {
		return [
			{ title: "Document Not Found - HOA Lens" },
			{ name: "description", content: "Document not found" },
		];
	}

	const { id, docName, hoa } = data;
	const locationString = [
		hoa?.location.city,
		hoa?.location.state,
		hoa?.location.zipcode,
	]
		.filter(Boolean)
		.join(", ");

	return [
		{
			title: `${
				hoa?.name || "HOA"
			} ${locationString} - ${docName} - HOA Lens`,
		},
		{
			name: "description",
			content: `${
				hoa?.name || "HOA"
			} documents ${locationString}. Access CC&Rs, rules and regulations, and AI-powered summaries for this community.`,
		},
		{
			property: "og:title",
			content: `${
				hoa?.name || "HOA"
			} ${locationString} - ${docName} - HOA Lens`,
		},
		{
			property: "og:type",
			content: "article",
		},
		{
			property: "og:url",
			content: `https://hoalens.com/docs/${id}`,
		},
		{
			property: "og:description",
			content: `${
				hoa?.name || "HOA"
			} HOA documents ${locationString}. Find community guidelines, regulations, and AI-powered document analysis.`,
		},
		// Additional location-specific meta tags
		{
			property: "og:locality",
			content: hoa?.location.city || "",
		},
		{
			property: "og:region",
			content: hoa?.location.state || "",
		},
		{
			property: "og:postal-code",
			content: hoa?.location.zipcode || "",
		},
		// Schema.org structured data tags for location
		{
			name: "geo.placename",
			content: `${hoa?.name || "HOA"} ${locationString}`,
		},
		{
			name: "geo.region",
			content: hoa?.location.state || "",
		},
	];
};

export default function DocViewer() {
	const params = useParams();
	const doc = useQuery(api.docs.getDocument, {
		id: params.docId as Id<"docs">,
	});

	const hoa = useQuery(
		api.hoas.getHoa,
		doc?.hoaId ? { id: doc?.hoaId } : "skip"
	);

	const [activeTab, setActiveTab] = useState("original");
	const [searchQuery, setSearchQuery] = useState("");
	const [matchCount, setMatchCount] = useState(0);
	const [currentMatch, setCurrentMatch] = useState(0);
	const [showTranscriptTab, setShowTranscriptTab] = useState(true);

	useEffect(() => {
		const handleResize = () => {
			const isSmallWindow = window.innerWidth < 1080;
			setShowTranscriptTab(isSmallWindow);
		};

		handleResize();

		window.addEventListener("resize", handleResize);
		setActiveTab(window.innerWidth < 1080 ? "transcript" : "original");

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const locationString = hoa
		? [hoa.location.city, hoa.location.state, hoa.location.zipcode].join(
				", "
		  )
		: "";

	const tabs = [
		{
			id: "transcript",
			label: "Transcript",
			icon: <FileText className="w-4 h-4" />,
		},
		{
			id: "original",
			label: "Original",
			icon: <File className="w-4 h-4" />,
		},
		{
			id: "summary",
			label: "Summary",
			icon: <Sparkles className="w-4 h-4" />,
		},
		{
			id: "chat",
			label: "Chat",
			icon: <MessageCircle className="w-4 h-4" />,
		},
		{ id: "search", label: "Search", icon: <Search className="w-4 h-4" /> },
	].filter((tab) => tab.id !== "transcript" || showTranscriptTab);

	const renderContent = () => {
		if (!doc) return null;
		switch (activeTab) {
			case "transcript":
				return (
					<Transcript
						transcript={doc.transcript}
						query={searchQuery}
						setMatchCount={setMatchCount}
						currentMatch={currentMatch}
						setCurrentMatch={setCurrentMatch}
						isSearching={false}
					/>
				);
			case "original":
				return <PdfViewer storageId={doc.storageId} />;
			case "summary":
				return <Summary document={doc} />;
			case "search":
				return (
					<>
						<SearchView
							query={searchQuery}
							setQuery={setSearchQuery}
							matchCount={matchCount}
							currentMatch={currentMatch}
							setCurrentMatch={setCurrentMatch}
						/>
						{showTranscriptTab && (
							<Transcript
								transcript={doc.transcript}
								query={searchQuery}
								setMatchCount={setMatchCount}
								currentMatch={currentMatch}
								setCurrentMatch={setCurrentMatch}
								isSearching={true}
							/>
						)}
					</>
				);
			case "chat":
				return <ChatView docId={doc._id} />;
			default:
				return null;
		}
	};

	if (!doc) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Loading document...
					</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen flex flex-col">
			<header className="bg-white shadow">
				<div className="mx-auto py-2 px-4 sm:px-6 lg:px-8">
					<Link to={`/hoa/${hoa?._id}`}>
						<div className="inline-flex flex-row items-center justify-start gap-1 hover:bg-slate-300 bg-slate-200 rounded ps-1 pe-2 text-sm text-gray-700 font-semibold">
							<ArrowLeft className="w-4 h-4 shrink-0" /> All
							Documents
						</div>
					</Link>
					<h1 className="text-xl font-bold text-gray-900">
						{doc.hoaName}, {locationString}
					</h1>
					<h2>{doc.docName}</h2>
				</div>
			</header>

			<main className="flex-1 p-6 min-h-0">
				<div className="mx-auto flex gap-4 h-full">
					{!showTranscriptTab && (
						<div className="flex-1 flex flex-col min-h-0">
							<h3 className="font-semibold text-lg mb-2">
								PDF Transcript
							</h3>
							<div className="flex-1 whitespace-pre-wrap bg-white text-black rounded-md p-5 overflow-y-auto min-h-0">
								<Transcript
									transcript={doc.transcript}
									query={searchQuery}
									setMatchCount={setMatchCount}
									currentMatch={currentMatch}
									setCurrentMatch={setCurrentMatch}
									isSearching={activeTab === "search"}
								/>
							</div>
						</div>
					)}

					<div className="flex-1 flex flex-col min-h-0">
						<div className="border-b border-gray-700 mb-2">
							<nav
								className="-mb-px flex space-x-8"
								aria-label="Tabs"
							>
								{tabs.map((tab) => (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`
                      flex items-center gap-2
                      whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                      ${
							activeTab === tab.id
								? "border-blue-500 text-blue-600"
								: "border-transparent text-gray-600 hover:text-gray-700 hover:border-black"
						}
                    `}
									>
										{tab.icon}
										<span className="hidden sm:block">
											{tab.label}
										</span>
									</button>
								))}
							</nav>
						</div>
						<h3 className="font-semibold text-lg mb-1 sm:hidden">
							{
								tabs.filter((tab) => tab.id === activeTab)[0]
									.label
							}
						</h3>
						<div className="flex-1 whitespace-pre-wrap bg-white text-black rounded-md p-5 overflow-y-auto min-h-0">
							{renderContent()}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
