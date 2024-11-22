export default function LoadingDots() {
	return (
		<div className="flex items-center space-x-1 py-4">
			<div
				className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
				style={{ animationDelay: "0ms" }}
			/>
			<div
				className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
				style={{ animationDelay: "150ms" }}
			/>
			<div
				className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
				style={{ animationDelay: "300ms" }}
			/>
		</div>
	);
}
