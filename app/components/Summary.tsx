import { useAction, useMutation } from "convex/react";

import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function Summary({ document }: { document: Doc<"docs"> }) {
	const [loading, setLoading] = useState(false);
	const generateSummary = useAction(api.pdf.generateSummary);
	const saveSummary = useMutation(api.docs.saveSummary);

	async function getSummary() {
		try {
			setLoading(true);
			const summary = await generateSummary({
				transcript: document.transcript,
			});
			await saveSummary({ summary: summary, docId: document._id });
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}

	if (!document.summary) {
		return (
			<div className="flex justify-center items-center h-full">
				{!loading ? (
					<button
						onClick={getSummary}
						className="bg-blue-500 text-white px-4 py-2 rounded-full flex flex-row items-center gap-2"
					>
						<Sparkles className="w-5 h-5" />
						Generate Summary
					</button>
				) : (
					<p>Loading...</p>
				)}
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div className="flex-grow">{document?.summary}</div>
			<div className="mt-auto text-xs">
				<hr className="border-t border-gray-300 my-4 text-gray-500" />
				AI generated content - please use at your own discretion.
			</div>
		</div>
	);
}
