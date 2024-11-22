import { Link } from "@remix-run/react";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

export default function RecentUploads() {
	const docs = useQuery(api.docs.getDocuments);
	return (
		<div className="mx-auto max-w-2xl pt-6 text-center">
			<p className="mb-2 font-bold">Recent Uploads</p>
			{docs !== undefined ? (
				<div className="flex flex-col gap-1">
					{docs?.map((doc) => (
						<Link
							to={`/hoa/${doc.hoaId}`}
							key={doc._id}
							className="text-blue-500 underline"
						>
							{doc.hoaName}
						</Link>
					))}
				</div>
			) : (
				<p>Loading...</p>
			)}
		</div>
	);
}
