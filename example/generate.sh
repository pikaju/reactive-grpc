#!/bin/sh

GRPC_TOOLS_NODE_PROTOC="npx grpc_tools_node_protoc"
 
PROTOS_DIR="protos"
OUT_DIR="./src/generated"
 
rm -rf $OUT_DIR
mkdir $OUT_DIR

${GRPC_TOOLS_NODE_PROTOC} \
    --js_out="import_style=commonjs,binary:${OUT_DIR}" \
    --ts_out="${OUT_DIR}" \
    --grpc_out="${OUT_DIR}" \
    -I="${PROTOS_DIR}" \
    ${PROTOS_DIR}/*.proto