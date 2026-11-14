import { deflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { unzipFirst } from "./zip";

/** ZIP minimal d'un fichier, tailles à 0 dans l'en-tête local (comme les ZIP Garmin, avec data descriptor). */
function makeZip(name: string, content: Buffer): Buffer {
  const nameBuf = Buffer.from(name);
  const data = deflateRawSync(content);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(nameBuf.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(8, 10);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(content.length, 24);
  central.writeUInt16LE(nameBuf.length, 28);
  central.writeUInt32LE(0, 42);
  const cdOffset = local.length + nameBuf.length + data.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt32LE(central.length + nameBuf.length, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  return Buffer.concat([local, nameBuf, data, central, nameBuf, eocd]);
}

describe("unzipFirst", () => {
  it("lit le premier fichier en prenant les tailles dans le répertoire central", () => {
    const content = Buffer.from("contenu FIT fictif ".repeat(20));
    const { name, data } = unzipFirst(makeZip("123_ACTIVITY.fit", content));
    expect(name).toBe("123_ACTIVITY.fit");
    expect(data.equals(content)).toBe(true);
  });

  it("refuse un fichier qui n'est pas un ZIP", () => {
    expect(() => unzipFirst(Buffer.from("pas un zip"))).toThrow();
  });
});
