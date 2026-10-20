import { describe, expect, it } from "vitest";
import { parseHours, availableTimes, openingStatus } from "../hospitality";
describe("restaurant hours",()=>{
 it("uses the restaurant's noon to 23:00 range",()=>{expect(parseHours("12:00 — 23:00")).toEqual({open:720,close:1380,closed:false});expect(availableTimes("12:00 — 23:00","2026-10-22",new Date("2026-10-20T16:00:00Z"))).toHaveLength(22)});
 it("disables closed days",()=>{expect(availableTimes("Closed","2026-10-22")).toEqual([])});
 it("calculates open now in New York, not the visitor timezone",()=>{expect(openingStatus("12:00 — 23:00",new Date("2026-10-20T16:00:00Z"))).toBe("Open now");expect(openingStatus("12:00 — 23:00",new Date("2026-10-20T15:59:00Z"))).toBe("Opens at 12:00 PM")});
 it("does not offer past times on today's New York date",()=>{const slots=availableTimes("12:00 — 23:00","2026-10-20",new Date("2026-10-20T16:00:00Z"));expect(slots[0]).toBe("12:30 PM");expect(slots).not.toContain("12:00 PM")});
});
