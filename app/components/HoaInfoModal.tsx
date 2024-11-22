import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "../components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (
		name: string,
		location: {
			city: string;
			state: string;
			zipcode: string;
		},
		docName: string
	) => void;
};

const US_STATES = [
	"AL",
	"AK",
	"AZ",
	"AR",
	"CA",
	"CO",
	"CT",
	"DE",
	"FL",
	"GA",
	"HI",
	"ID",
	"IL",
	"IN",
	"IA",
	"KS",
	"KY",
	"LA",
	"ME",
	"MD",
	"MA",
	"MI",
	"MN",
	"MS",
	"MO",
	"MT",
	"NE",
	"NV",
	"NH",
	"NJ",
	"NM",
	"NY",
	"NC",
	"ND",
	"OH",
	"OK",
	"OR",
	"PA",
	"RI",
	"SC",
	"SD",
	"TN",
	"TX",
	"UT",
	"VT",
	"VA",
	"WA",
	"WV",
	"WI",
	"WY",
];

export default function HoaInfoDialog({ isOpen, onClose, onSubmit }: Props) {
	const [hoaInfo, setHoaInfo] = useState({
		name: "",
		city: "",
		state: "",
		zipcode: "",
		documentType: "",
		customDocumentName: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (validateForm()) {
			onSubmit(
				hoaInfo.name.trim(),
				{
					city: hoaInfo.city.trim(),
					state: hoaInfo.city,
					zipcode: hoaInfo.zipcode,
				},
				hoaInfo.customDocumentName || hoaInfo.documentType
			);
			onClose();
		}
	}

	function validateForm(): boolean {
		const newErrors: Record<string, string> = {};

		if (!hoaInfo.name.trim()) {
			newErrors.name = "HOA Name is required";
		}
		if (!hoaInfo.documentType) {
			newErrors.documentType = "Document Type is required";
		}
		if (
			hoaInfo.documentType === "other" &&
			!hoaInfo.customDocumentName.trim()
		) {
			newErrors.customDocumentName = "Document Name is required";
		}
		if (!hoaInfo.city.trim()) {
			newErrors.city = "City is required";
		}
		if (!hoaInfo.state) {
			newErrors.state = "State is required";
		}
		if (!hoaInfo.zipcode.match(/^\d{5}$/)) {
			newErrors.zipcode = "Valid ZIP Code is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>HOA Information</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-2">
					<div className="space-y-1">
						<Label htmlFor="hoaName">HOA Name</Label>
						<Input
							id="hoaName"
							required
							value={hoaInfo.name}
							onChange={(e) =>
								setHoaInfo((prev) => ({
									...prev,
									name: e.target.value,
								}))
							}
						/>
						{errors.name && (
							<p className="text-sm text-red-500">
								{errors.name}
							</p>
						)}
					</div>
					<div className="space-y-1">
						<Label htmlFor="documentType">Document Type</Label>
						<Select
							required
							value={hoaInfo.documentType}
							onValueChange={(value) =>
								setHoaInfo((prev) => ({
									...prev,
									documentType: value,
									customDocumentName: "",
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select document type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ccr">
									Covenants, Conditions & Restrictions (CC&Rs)
								</SelectItem>
								<SelectItem value="rules">
									Rules & Regulations
								</SelectItem>
								<SelectItem value="bylaws">Bylaws</SelectItem>
								<SelectItem value="other">Other</SelectItem>
							</SelectContent>
						</Select>
						{errors.documentType && (
							<p className="text-sm text-red-500">
								{errors.documentType}
							</p>
						)}
					</div>
					{hoaInfo.documentType === "other" && (
						<div className="space-y-1">
							<Label htmlFor="customDocumentName">
								Custom Document Name
							</Label>
							<Input
								id="customDocumentName"
								required
								value={hoaInfo.customDocumentName}
								onChange={(e) =>
									setHoaInfo((prev) => ({
										...prev,
										customDocumentName: e.target.value,
									}))
								}
							/>
							{errors.customDocumentName && (
								<p className="text-sm text-red-500">
									{errors.customDocumentName}
								</p>
							)}
						</div>
					)}
					<div className="space-y-1">
						<Label htmlFor="city">City</Label>
						<Input
							id="city"
							required
							value={hoaInfo.city}
							onChange={(e) =>
								setHoaInfo((prev) => ({
									...prev,
									city: e.target.value,
								}))
							}
						/>
						{errors.city && (
							<p className="text-sm text-red-500">
								{errors.city}
							</p>
						)}
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<Label htmlFor="state">State</Label>
							<Select
								required
								value={hoaInfo.state}
								onValueChange={(value) =>
									setHoaInfo((prev) => ({
										...prev,
										state: value,
									}))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="State" />
								</SelectTrigger>
								<SelectContent>
									{US_STATES.map((state) => (
										<SelectItem key={state} value={state}>
											{state}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errors.state && (
								<p className="text-sm text-red-500">
									{errors.state}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="zipcode">ZIP Code</Label>
							<Input
								id="zipcode"
								required
								pattern="[0-9]{5}"
								value={hoaInfo.zipcode}
								onChange={(e) =>
									setHoaInfo((prev) => ({
										...prev,
										zipcode: e.target.value,
									}))
								}
							/>
							{errors.zipcode && (
								<p className="text-sm text-red-500">
									{errors.zipcode}
								</p>
							)}
						</div>
					</div>
					<div className="flex justify-end space-x-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Cancel
						</Button>
						<Button type="submit">Continue Upload</Button>
					</div>
				</form>
				<DialogDescription></DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
