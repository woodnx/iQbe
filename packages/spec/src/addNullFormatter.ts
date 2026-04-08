import ts from "typescript";

// const filepath = new URL("./gen/schema.ts", import.meta.url).toString();
// const program = ts.createProgram([filepath], {});
// const typeChecker = program.getTypeChecker();

// function isNeverType(node: ts.Node): boolean {
//   const type = typeChecker.getTypeAtLocation(node);

//   return type.flags === ts.TypeFlags.Never;
// }

export default function addNullFormatter<T extends ts.Node>(
  context: ts.TransformationContext,
) {
  return (rootNode: T) => {
    const visit = (node: ts.Node): ts.Node => {
      node = ts.visitEachChild(node, visit, context);

      // Optionalなプロパティを見つけたら、型に`| null`を追加
      if (ts.isPropertySignature(node) && node.type) {
        // if (node.questionToken && isNeverType(node.type)) {
        //   return ts.factory.updatePropertySignature(node, node.modifiers, node.name, undefined, node.type);
        // }
        // else
        if (node.questionToken) {
          const unionType = ts.factory.createUnionTypeNode([
            node.type,
            ts.factory.createLiteralTypeNode(ts.factory.createNull()),
          ]);

          return ts.factory.updatePropertySignature(
            node,
            node.modifiers,
            node.name,
            node.questionToken,
            unionType,
          );
        }
      }

      return node;
    };

    return ts.visitNode(rootNode, visit);
  };
}
