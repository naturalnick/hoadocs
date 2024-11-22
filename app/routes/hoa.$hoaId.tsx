import { Link, useParams } from "@remix-run/react";
import { ArrowLeft, File } from "lucide-react";

// import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
// import { ConvexHttpClient } from "convex/browser";
import { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// export async function loader({ params }: LoaderFunctionArgs) {
//   const client = new ConvexHttpClient(process.env.CONVEX_URL!);

//   try {
//     const hoa = await client.query(api.docs.getHoaMeta, {
//       id: params.hoaId,
//     });

//     return { hoa };
//   } catch (error) {
//     return { hoa: null };
//   }
// }

// export const meta: MetaFunction<typeof loader> = ({ data }) => {
//   if (!data || !data.hoa) {
//     return [
//       { title: "HOA Not Found - HOA Lens" },
//       { name: "description", content: "HOA not found" },
//     ];
//   }

//   const { name, location } = data.hoa;
//   const locationString = [location.city, location.state, location.zipcode]
//     .filter(Boolean)
//     .join(", ");

//   return [
//     {
//       title: `${name || "HOA"} Documents ${locationString} - HOA Lens`,
//     },
//     {
//       name: "description",
//       content: `View all documents for ${name || "HOA"} ${locationString}. Access CC&Rs, rules and regulations, and other community documents.`,
//     },
//   ];
// };

export default function HoaPage() {
	const params = useParams();
	const hoa = useQuery(
		api.hoas.getHoa,
		params.hoaId
			? {
					id: params.hoaId as Id<"hoas">,
			  }
			: "skip"
	);

	const documents = useQuery(api.docs.getDocuments);

	if (!hoa) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900">
						Loading HOA information...
					</h1>
				</div>
			</div>
		);
	}

	const locationString = [
		hoa.location.city,
		hoa.location.state,
		hoa.location.zipcode,
	]
		.filter(Boolean)
		.join(", ");

	return (
		<div className="min-h-screen w-full flex">
			<div className="flex flex-col w-full">
				<header className="bg-white shadow w-full">
					<div className="mx-auto py-2 px-4 sm:px-6 lg:px-8">
						<Link to="..">
							<div className="inline-flex flex-row items-center justify-start gap-1 hover:bg-slate-300 bg-slate-200 rounded ps-1 pe-2 text-sm font-semibold">
								<ArrowLeft className="w-4 h-4 shrink-0" /> Back
							</div>
						</Link>
						<h1 className="text-xl font-bold text-gray-900">
							{hoa.name}, {locationString}
						</h1>
						<h2 className="text-gray-600">Available Documents</h2>
					</div>
				</header>

				<main className="flex-1 p-6">
					<div className="mx-auto max-w-4xl">
						<div className="bg-white rounded-lg shadow">
							<ul className="divide-y divide-gray-200">
								{documents?.map((doc, index) => (
									<li key={doc._id}>
										<Link
											to={`/doc/${doc._id}`}
											className={`block hover:bg-gray-50 ${
												index === 0 ||
												index === documents.length - 1
													? "rounded-lg"
													: ""
											}`}
										>
											<div className="px-4 py-4 sm:px-6">
												<div className="flex items-center">
													<File className="w-5 h-5 text-gray-400 mr-3" />
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium text-blue-600 truncate">
															{doc.docName}
														</p>
														<p className="text-sm text-gray-500">
															Added{" "}
															{new Date(
																doc._creationTime
															).toLocaleDateString()}
														</p>
													</div>
												</div>
											</div>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
