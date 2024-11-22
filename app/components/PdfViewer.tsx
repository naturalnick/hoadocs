import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";

export default function PdfViewer({
	storageId,
}: {
	storageId: Id<"_storage">;
}) {
	const storageUrl = useQuery(api.docs.getStorageUrl, { storageId });

	return storageUrl ? (
		<iframe
			src={storageUrl}
			className="w-full h-full border-none"
			title="PDF Viewer"
		/>
	) : (
		<p>Loading...</p>
	);
}
