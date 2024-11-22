import { internalQuery, mutation, query } from "./_generated/server";

import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
	return await ctx.storage.generateUploadUrl();
});

export const saveDocument = mutation({
	args: {
		storageId: v.id("_storage"),
		transcript: v.string(),
		summary: v.union(v.string(), v.null()),
		docName: v.string(),
		hoaId: v.id("hoas"),
	},
	handler: async (ctx, args) => {
		const docId = await ctx.db.insert("docs", {
			storageId: args.storageId,
			transcript: args.transcript,
			uploadedAt: Date.now(),
			status: "pending",
			updatedAt: Date.now(),
			docName: args.docName,
			hoaId: args.hoaId,
		});

		return docId;
	},
});

export const saveSummary = mutation({
	args: {
		docId: v.id("docs"),
		summary: v.string(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.docId, {
			summary: args.summary,
		});
	},
});

export const getDocument = query({
	args: { id: v.id("docs") },
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.id);

		if (!document) return null;

		const url = await ctx.storage.getUrl(document.storageId);

		return { ...document, url };
	},
});

export const getDocuments = query({
	handler: async (ctx) => {
		const documents = await ctx.db.query("docs").take(10);

		return documents ?? null;
	},
});

export const getDocumentMeta = query({
	args: { id: v.id("docs") },
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.id);

		const hoa = document?.hoaId ? await ctx.db.get(document?.hoaId) : null;

		if (!document) {
			return null;
		}

		return {
			id: args.id,
			docName: document.docName,
			hoa: hoa,
		};
	},
});

export const getStorageUrl = query({
	args: { storageId: v.id("_storage") },
	handler: async (ctx, args) => {
		const url = await ctx.storage.getUrl(args.storageId);
		return url;
	},
});

export const getDocTranscript = internalQuery({
	args: { docId: v.id("docs") },
	handler: async (ctx, args) => {
		const doc = await ctx.db.get(args.docId);
		return doc?.transcript ?? "";
	},
});
