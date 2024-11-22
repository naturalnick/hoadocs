type Props = {
	onClick: (question: string) => void;
};

export default function SampleQuestions({ onClick }: Props) {
	return (
		<div className="flex flex-col sm:flex-row pb-4 gap-3">
			<button
				className="flex-1 p-3 sm:p-6 border rounded hover:bg-slate-100"
				onClick={() => onClick("What are the parking rules?")}
			>
				<p className="text-sm text-start ">
					What are the parking rules?
				</p>
			</button>
			<button
				className="flex-1 p-3 sm:p-6 border rounded hover:bg-slate-100"
				onClick={() =>
					onClick("What are the noise restrictions and quiet hours?")
				}
			>
				<p className="text-sm text-start ">
					What are the noise restrictions and quiet hours?
				</p>
			</button>
			<button
				className="flex-1 p-3 sm:p-6 border rounded hover:bg-slate-100"
				onClick={() =>
					onClick(
						"What modifications can I make to my home's exterior without HOA approval?"
					)
				}
			>
				<p className="text-sm text-start ">
					What modifications can I make to my home&apos;s exterior
					without HOA approval?
				</p>
			</button>
		</div>
	);
}
