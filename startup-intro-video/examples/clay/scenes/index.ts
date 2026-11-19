import React from "react";
import { Hook } from "./Hook";
import { What } from "./What";
import { Problem } from "./Problem";
import { Origins } from "./Origins";
import { Product } from "./Product";
import { Gtme } from "./Gtme";
import { Moat, Position } from "./MoatPosition";
import { Model, Risk, Verdict } from "./ModelRiskVerdict";

export const SCENES: Record<string, React.FC> = {
  hook: Hook,
  problem: Problem,
  what: What,
  origins: Origins,
  product: Product,
  gtme: Gtme,
  moat: Moat,
  position: Position,
  model: Model,
  risk: Risk,
  verdict: Verdict,
};
