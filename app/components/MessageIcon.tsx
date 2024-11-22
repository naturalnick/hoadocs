import { BotMessageSquare, SquareUserRound } from "lucide-react";

type Props = {
	role: "user" | "assistant" | "system";
};

export default function MessageIcon({ role }: Props) {
	switch (role) {
		case "user":
			return <SquareUserRound className="w-5 h-5 shrink-0" />;
		case "assistant":
		case "system":
			return <BotMessageSquare className="w-5 h-5 shrink-0 ms-1" />;
	}
}
