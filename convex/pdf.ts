"use node";

import * as fs from "fs/promises";
import * as os from "os";
import * as path from "path";

import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { v } from "convex/values";
import fetch from "node-fetch";
import OpenAI from "openai";
import { PDFDocument } from "pdf-lib";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

// http://localhost:5173/hoa/j57a1j9ewby1j1pmr1w5qytmj174mmff
export const convertPdfToText = action({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		const url = await ctx.storage.getUrl(args.storageId);
		if (!url) return;
		const pdfResponse = await fetch(url);

		const arrayBuffer = await pdfResponse.arrayBuffer();
		const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

		const anthropic = new Anthropic();
		let transcript = "";
		const chunks = await processPDFInChunks(pdfBase64);
		const delay = (ms: number) =>
			new Promise((resolve) => setTimeout(resolve, ms));
		for (const chunk of chunks) {
			const response = await anthropic.beta.messages.create({
				model: "claude-3-5-sonnet-20241022",
				betas: ["pdfs-2024-09-25"],
				max_tokens: 8192,
				system: "You are an expert at extracting and structuring text from PDFs.",
				messages: [
					{
						content: [
							{
								type: "document",
								source: {
									media_type: "application/pdf",
									type: "base64",
									data: chunk,
								},
							},
							{
								type: "text",
								text: "Extract and output all text from all pages of the PDF VERBATIM. Do not summarize, do not truncate, do not add any explanatory text, and do not add any '[Continues...]' or similar notations. For images and diagrams, do not provide detailed descriptions - a simple [Diagram] or [Image] tag will suffice. Output the exact text as it appears, maintaining all formatting and punctuation.",
							},
						],
						role: "user",
					},
				],
			});

			console.log(response.usage);

			transcript =
				transcript +
				"\n-\n" +
				(response.content[0].type === "text"
					? response.content[0].text
					: String(response.content));
			await delay(500);
		}

		return transcript;
	},
});

export const convertPdfToTextGemini = action({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		try {
			const url = await ctx.storage.getUrl(args.storageId);
			if (!url) return;

			const response = await fetch(url);
			const arrayBuffer = await response.arrayBuffer();
			const fileBuffer = Buffer.from(arrayBuffer);

			const tempDir = os.tmpdir();
			const tempFilePath = path.join(tempDir, `temp-${Date.now()}.pdf`);
			await fs.writeFile(tempFilePath, fileBuffer);

			const genAI = new GoogleGenerativeAI(
				process.env["GEMINI_API_KEY"]!
			);
			const fileManager = new GoogleAIFileManager(
				process.env["GEMINI_API_KEY"]!
			);

			const uploadResponse = await fileManager.uploadFile(tempFilePath, {
				mimeType: "application/pdf",
				displayName: "Gemini 1.5 PDF",
			});

			const model = genAI.getGenerativeModel({
				model: "gemini-exp-1114",
			});

			const result = await model.generateContent([
				{
					fileData: {
						mimeType: uploadResponse.file.mimeType,
						fileUri: uploadResponse.file.uri,
					},
				},
				{
					text: "Extract and output all text from all pages of the PDF VERBATIM. Do not summarize, do not truncate, do not add any explanatory text, and do not add any '[Continues...]' or similar notations. Output the exact text, improving formatting and layout if necessary.",
				},
			]);

			console.log(result.response.usageMetadata);
			return result.response.text();
		} catch (error) {
			console.error(error);
		}
	},
});

// async function getPdfRestResponse(pdfBase64: string) {
// 	try {
// 		const pdfBuffer = Buffer.from(pdfBase64, "base64");

// 		const data = new FormData();
// 		data.append("file", pdfBuffer, {
// 			filename: "document.pdf",
// 			contentType: "application/pdf",
// 		});
// 		data.append("output", "pdfrest_pdf-with-ocr-text");

// 		const config = {
// 			method: "post",
// 			maxBodyLength: Infinity,
// 			url: "https://api.pdfrest.com/pdf-with-ocr-text",
// 			headers: {
// 				"Api-Key": "e47014f1-1212-47f5-8cdb-0fa1a5898a99",
// 				...data.getHeaders(),
// 			},
// 			data: data,
// 		};

// 		const response = await axios(config);
// 		console.log("HERE");
// 		console.log(response.data);
// 		return response.data;
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

// async function extractPdfText(url: string) {
// 	try {
// 		const pdfResponse = await axios.get(url, {
// 			responseType: "arraybuffer",
// 			headers: {
// 				Accept: "application/pdf",
// 			},
// 		});

// 		const data = new FormData();
// 		data.append("file", Buffer.from(pdfResponse.data), {
// 			filename: "document.pdf",
// 			contentType: "application/pdf",
// 		});
// 		data.append("word_style", "on");
// 		data.append("output_type", "json");

// 		const config = {
// 			method: "post",
// 			maxBodyLength: Infinity,
// 			url: "https://api.pdfrest.com/extracted-text",
// 			headers: {
// 				"Api-Key": "e47014f1-1212-47f5-8cdb-0fa1a5898a99",
// 				...data.getHeaders(),
// 			},
// 			data: data,
// 		};

// 		const res = await axios(config);
// 		console.log(res.data);
// 		console.log(res.data.fullText);
// 		return String(res.data.fullText);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }

async function processPDFInChunks(pdfBase64: string): Promise<string[]> {
	const pdfDoc = await PDFDocument.load(Buffer.from(pdfBase64, "base64"));
	const pageCount = pdfDoc.getPageCount();
	const chunks: string[] = [];

	for (let i = 0; i < pageCount; i++) {
		const endPage = Math.min(i + 1, pageCount);
		const subsetPdf = await PDFDocument.create();

		const pages = await subsetPdf.copyPages(
			pdfDoc,
			Array.from({ length: endPage - i }, (_, index) => i + index)
		);

		pages.forEach((page) => subsetPdf.addPage(page));
		chunks.push(await subsetPdf.saveAsBase64());
	}

	return chunks;
}

export const generateSummary = action({
	args: { transcript: v.string() },
	handler: async (_, args) => {
		try {
			const anthropic = new Anthropic();
			const response = await anthropic.messages.create({
				model: "claude-3-5-sonnet-20241022",
				max_tokens: 8190,
				messages: [
					{
						role: "user",
						content: `You are an expert in analyzing HOA and legal documents. Please provide a clear, concise summary of the key points from this HOA document. Focus on:
		
		- Important rules and regulations
		- Homeowner rights and responsibilities
		- Critical restrictions or requirements
		- Notable policies that affect daily life
		- Financial obligations
		- Enforcement mechanisms
		
		Please present this information in clear, simple language that homeowners can easily understand without any conversation. Here's the document:
		${args.transcript}`,
					},
				],
				temperature: 0.3, // Lower temperature for more focused, consistent output
			});

			return response.content[0].type === "text"
				? response.content[0].text
				: String(response.content[0]);
		} catch (error) {
			console.error("Error generating HOA document summary:", error);
			throw error;
		}
	},
});

export const messageSchema = v.object({
	role: v.union(
		v.literal("user"),
		v.literal("assistant"),
		v.literal("system")
	),
	content: v.string(),
});

export const chatWithPdf = action({
	args: { docId: v.id("docs"), messages: v.array(messageSchema) },
	handler: async (ctx, args) => {
		try {
			const transcript = await ctx.runQuery(
				internal.docs.getDocTranscript,
				{
					docId: args.docId,
				}
			);

			const newMessages: OpenAI.ChatCompletionMessageParam[] = [
				...(transcript
					? [
							{
								role: "system" as const,
								content: `You are a helpful AI assistant analyzing an HOA PDF document. Here is the document content:\n\n${transcript}\n\nPlease use this content to answer questions accurately. If a question cannot be answered using the document content, please say so.`,
							},
					  ]
					: []),
				...(args.messages as OpenAI.ChatCompletionMessageParam[]),
			];

			const openai = new OpenAI();
			const response = await openai.chat.completions.create({
				messages: newMessages,
				model: "gpt-4o-mini",
			});

			const assistantResponse = response.choices[0].message.content;

			return assistantResponse;
		} catch (error) {
			console.error("Error calling Claude API:", error);
			throw new Error("Failed to get AI response");
		}
	},
});
