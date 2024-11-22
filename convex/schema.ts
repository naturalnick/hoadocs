// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema({
	docs: defineTable({
		storageId: v.id("_storage"),
		uploadedAt: v.number(),
		hoaId: v.optional(v.id("hoas")),
		hoaName: v.optional(v.string()),
		docName: v.optional(v.string()),
		location: v.optional(
			v.object({
				city: v.string(),
				state: v.string(),
				zipcode: v.string(),
			})
		),
		documentType: v.optional(v.string()), //get rid of
		status: v.union(
			v.literal("pending"),
			v.literal("processing"),
			v.literal("completed"),
			v.literal("failed")
		),
		summary: v.optional(v.string()),
		transcript: v.string(),
		error: v.optional(v.string()),
		updatedAt: v.number(),
	}),

	hoas: defineTable({
		name: v.string(),
		location: v.object({
			city: v.string(),
			state: v.string(),
			zipcode: v.string(),
		}),
		dateUpdated: v.number(),
		dateCreated: v.number(),
	}),
});
