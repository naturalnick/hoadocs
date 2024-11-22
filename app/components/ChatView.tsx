import { Info, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Id } from "convex/_generated/dataModel";
import LoadingDots from "./LoadingDots";
import MessageIcon from "./MessageIcon";
import SampleQuestions from "./SampleQuestions";
import { api } from "convex/_generated/api";
import { useAction } from "convex/react";

type Props = { docId: Id<"docs"> };

export default function ChatView({ docId }: Props) {
	const chatWithPdf = useAction(api.pdf.chatWithPdf);

	const [messages, setMessages] =
		useState<
			{ role: "user" | "assistant" | "system"; content: string }[]
		>();
	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	async function handleSendMessage(message: string) {
		try {
			setLoading(true);
			const questionObj: {
				role: "user" | "assistant" | "system";
				content: string;
			} = { role: "user" as const, content: message };
			const newMessages = messages
				? [...messages, questionObj]
				: [questionObj];

			setMessages((prevMessages) => {
				if (!prevMessages) return [questionObj];
				return [...prevMessages, questionObj];
			});
			setQuestion("");

			const response = await chatWithPdf({
				docId: docId,
				messages: newMessages,
			});

			if (!response) return;

			const responseObject: {
				role: "user" | "assistant" | "system";
				content: string;
			} = { role: "assistant", content: response };

			setMessages((prevMessages) => {
				if (!prevMessages) return [responseObject];
				return [...prevMessages, responseObject];
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col h-full relative">
			{messages ? (
				<div className="flex flex-col flex-grow gap-3 pb-10">
					{messages?.map((msg, index) => (
						<div
							key={msg.role + index}
							className={`${
								msg.role === "user"
									? "bg-slate-300 rounded-r-lg rounded-tl-lg p-2 flex flex-row"
									: ""
							}`}
						>
							<p
								key={msg.role + index}
								className="flex gap-2 leading-normal"
							>
								<span className="inline-flex">
									<MessageIcon role={msg.role} />
								</span>
								<span className="inline">{msg.content}</span>
							</p>
						</div>
					))}
					{loading && <LoadingDots />}
					<div ref={messagesEndRef} />
				</div>
			) : (
				<div className="h-full flex flex-col">
					<div className="border rounded text-sm p-2 flex gap-1 items-start">
						<Info className="w-5 h-5 shrink-0" />
						<div className="block gap-2">
							You can chat with this document using AI. Use the
							text field below to ask a question.{" "}
							<span className="opacity-50">
								*AI can make mistakes, always verify important
								details.
							</span>
						</div>
					</div>
					<div className="flex flex-grow"></div>
					<p className="text-sm pb-1">Examples</p>
					<SampleQuestions onClick={handleSendMessage} />
				</div>
			)}
			<div className="flex w-full gap-1.5 sticky bottom-0">
				<input
					id="search"
					type="text"
					value={question}
					onChange={(event) => setQuestion(event.currentTarget.value)}
					className="w-full rounded py-1 px-2 bg-white border border-slate-400 shadow"
					placeholder="Ask something..."
				/>
				<button
					onClick={() => handleSendMessage(question)}
					className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 shadow"
					disabled={loading}
				>
					<Send className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}
