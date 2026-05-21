---
type: "query"
date: "2026-05-21T04:35:07.045559+00:00"
question: "Why does cn() connect Chat & Theme UI to GetStarted Landing Page Components?"
contributor: "graphify"
source_nodes: ["cn", "GetStarted", "Message", "Card"]
---

# Q: Why does cn() connect Chat & Theme UI to GetStarted Landing Page Components?

## Answer

cn() located in lib/utils.ts:L4 is a core style-merging utility imported by UI components in both communities. It is called by Message() in app/product/Chat/Message.tsx:L4 (Community 0) to resolve dynamic chat styling, and by reusable Card primitives in components/ui/card.tsx:L5 which are composed within GetStarted() in app/(splash)/GetStarted/GetStarted.tsx:L14 (Community 16).

## Source Nodes

- cn
- GetStarted
- Message
- Card