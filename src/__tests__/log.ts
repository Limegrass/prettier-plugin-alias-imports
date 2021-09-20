import debug from "debug";
import "#src/log";
import pkg from "#root/package.json";

jest.mock("debug");

describe("log", () => {
    // Ensure they align, even though it is not imported in the code
    it("uses the package name", () => {
        expect(debug).toHaveBeenCalledWith(pkg.name);
    });
});
