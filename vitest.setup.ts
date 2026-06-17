import "@testing-library/jest-dom";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";

// Extend vitest's expect method with vitest-axe matchers
expect.extend(matchers);

// jsdom doesn't implement scrollIntoView — provide a no-op stub.
Element.prototype.scrollIntoView = () => {};
