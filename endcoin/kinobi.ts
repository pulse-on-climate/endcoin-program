import { createFromRoot } from 'kinobi';
import { rootNodeFromAnchor, AnchorIdl } from '@kinobi-so/nodes-from-anchor';
import { renderVisitor as renderJavaScriptVisitor } from "@kinobi-so/renderers-js";
import anchorIdl from './target/idl/endcoin.json';
import path from 'path';

const kinobi = createFromRoot(rootNodeFromAnchor(anchorIdl as AnchorIdl));

const jsClient = path.join(__dirname, "..", "clients", "js");
  
kinobi.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"))
);