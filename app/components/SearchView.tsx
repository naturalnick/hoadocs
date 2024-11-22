import { Dispatch, KeyboardEvent, SetStateAction, useState } from "react";

import { X } from "lucide-react";

export default function SearchView({
	query,
	setQuery,
	matchCount,
	currentMatch = 1,
	setCurrentMatch,
}: {
	query: string;
	setQuery: Dispatch<SetStateAction<string>>;
	matchCount: number;
	currentMatch: number;
	setCurrentMatch: Dispatch<SetStateAction<number>>;
}) {
	const [searchText, setSearchText] = useState("");

	function handleFind() {
		if (query === searchText && searchText !== "") {
			handleNavigate("next");
		}
		setQuery(searchText);
	}

	function handleKeyPress(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			handleFind();
		}
	}

	function handleClear() {
		setSearchText("");
		setQuery("");
		setCurrentMatch(0);
	}

	function handleNavigate(direction: "next" | "prev") {
		if (direction === "next") {
			setCurrentMatch((prev) => {
				if (prev >= matchCount - 1) return 0;
				else return prev + 1;
			});
		} else if (direction === "prev") {
			setCurrentMatch((prev) => {
				console.log("prev", prev);
				if (prev - 1 < 0) return matchCount - 1;
				else return prev - 1;
			});
		}
	}

	return (
		<div className="flex flex-col gap-2 sticky top-0 bg-white">
			<div className="flex w-full gap-1.5">
				<div className="relative w-full">
					<input
						id="search"
						type="text"
						value={searchText}
						onChange={(event) =>
							setSearchText(event.currentTarget.value)
						}
						onKeyUp={handleKeyPress}
						className="w-full rounded py-1 px-2 bg-white border border-slate-400 pr-8"
					/>
					{searchText && (
						<button
							onClick={handleClear}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
							aria-label="Clear search"
						>
							<X size={16} />
						</button>
					)}
				</div>
				<button
					onClick={handleFind}
					className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Find
				</button>
			</div>
			{query.trim() !== "" && (
				<div className="flex items-center gap-2">
					<button
						onClick={() => handleNavigate("prev")}
						disabled={matchCount === 0}
						className="px-2 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
					>
						←
					</button>
					<button
						onClick={() => handleNavigate("next")}
						disabled={matchCount === 0}
						className="px-2 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100"
					>
						→
					</button>
					<span className="text-sm text-gray-600 text-nowrap">
						{matchCount > 0 ? currentMatch + 1 : 0} of {matchCount}{" "}
						matches for{" "}
						<span className="text-black">&quot;{query}&quot;</span>
					</span>
				</div>
			)}
		</div>
	);
}
