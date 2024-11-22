import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from "react";

type Props = {
	transcript: string;
	query: string;
	setMatchCount: Dispatch<SetStateAction<number>>;
	currentMatch: number;
	setCurrentMatch: Dispatch<SetStateAction<number>>;
	isSearching: boolean;
};

export default function Transcript({
	transcript,
	query,
	setMatchCount,
	currentMatch,
	setCurrentMatch,
	isSearching,
}: Props) {
	const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

	const escapedQuery = useMemo(
		() => query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
		[query]
	);

	const parts = useMemo(
		() => transcript.split(new RegExp(`(${escapedQuery})`, "gi")),
		[transcript, escapedQuery]
	);

	useEffect(() => {
		if (!query?.trim()) {
			setMatchCount(0);
			return;
		}

		const matches = transcript.match(new RegExp(escapedQuery, "gi"));
		const count = matches ? matches.length : 0;
		setMatchCount(count);
		setCurrentMatch(0);
	}, [query, transcript, setMatchCount, setCurrentMatch, escapedQuery]);

	useEffect(() => {
		if (matchRefs.current[currentMatch]) {
			matchRefs.current[currentMatch]?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [currentMatch, query]);

	if (!query?.trim() || !isSearching) {
		return transcript;
	}

	let matchIndex = 0;

	return (
		<>
			{parts.map((part, index) => {
				const isMatch = part.toLowerCase() === query.toLowerCase();

				if (isMatch) {
					const currentMatchIndex = matchIndex;
					matchIndex++;
					return (
						<span
							key={index}
							ref={(element) =>
								(matchRefs.current[currentMatchIndex] = element)
							}
							className={`${
								currentMatchIndex === currentMatch
									? "bg-yellow-200 ring-2 ring-blue-500 ring-offset-[3px] ring-opacity-50"
									: "bg-yellow-200"
							}`}
						>
							{part}
						</span>
					);
				}

				return <span key={index}>{part}</span>;
			})}
		</>
	);
}
