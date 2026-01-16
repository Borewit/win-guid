import { describe, it } from "mocha";
import { assert } from "chai";

import { Guid } from "../lib/guid.js";

describe("Guid", () => {
	it("should use Windows GUID byte order", () => {
		const guid = Guid.fromString("00112233-4455-6677-8899-AABBCCDDEEFF");

		const expectedWindowsBytes  = new Uint8Array([
			0x33, 0x22, 0x11, 0x00, 0x55, 0x44, 0x77, 0x66, 0x88, 0x99, 0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF,
		]);

		assert.deepEqual(guid.bytes, expectedWindowsBytes , "Windows GUID raw byte layout");
	});

	it("should throw on invalid GUID strings", () => {
		assert.throws(() => {
			Guid.fromString("00020906-0000-0000-C000-00000000004Z");
		}, /Invalid GUID format/i);

		assert.throws(() => {
			Guid.fromString("0002090600000000C000000000000046");
		}, /Invalid GUID format/i);

		assert.throws(() => {
			Guid.fromString("00020906-0000-000-C000-000000000046");
		}, /Invalid GUID format/i);

		assert.throws(() => {
			Guid.fromString("");
		}, /Invalid GUID format/i);
	});

	it("should return false when comparing against non-matching bytes", () => {
		const guid = Guid.fromString("00020906-0000-0000-C000-000000000046");

		const different = new Uint8Array([
			0x07, 0x09, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xc0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46,
		]);

		assert.isFalse(guid.equals(different));
	});

	it("should return false when buffer is too short or offset is out of range", () => {
		const guid = Guid.fromString("00020906-0000-0000-C000-000000000046");

		assert.isFalse(guid.equals(new Uint8Array(0)));
		assert.isFalse(guid.equals(new Uint8Array(15)));

		const buf = new Uint8Array(16);
		assert.isFalse(guid.equals(buf, 1));
		assert.isFalse(guid.equals(buf, -1));
	});

	it("should construct GUID from string", () => {
		const guid = Guid.fromString("75B22630-668E-11CF-A6D9-00AA0062CE6C");

		const guid_data = new Uint8Array([
			48, 38, 178, 117, 142, 102, 207, 17, 166, 217, 0, 170, 0, 98, 206, 108,
		]);

		assert.isTrue(guid.equals(guid_data));
	});

	it("toString should produce canonical GUID string in standard byte order", () => {
		const s = "00020906-0000-0000-C000-000000000046";
		const guid = Guid.fromString(s);

		// toString returns lowercase canonical
		assert.strictEqual(guid.toString(), s);
	});

	it("toString should roundtrip with mixed case input", () => {
		const s = "75b22630-668E-11cf-A6d9-00aa0062CE6c";
		const guid = Guid.fromString(s);
		assert.strictEqual(guid.toString(), "75B22630-668E-11CF-A6D9-00AA0062CE6C");
	});

});
