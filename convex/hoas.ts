import { mutation, query } from "./_generated/server";

import { v } from "convex/values";

export const addHoa = mutation({
	args: {
		name: v.string(),
		location: v.object({
			city: v.string(),
			state: v.string(),
			zipcode: v.string(),
		}),
	},
	handler: async (ctx, args) => {
		const hoaId = await ctx.db.insert("hoas", {
			name: args.name,
			location: args.location,
			dateUpdated: Date.now(),
			dateCreated: Date.now(),
		});

		return hoaId;
	},
});

export const getHoa = query({
	args: { id: v.id("hoas") },
	handler: async (ctx, args) => {
		const document = await ctx.db.get(args.id);
		return document;
	},
});
