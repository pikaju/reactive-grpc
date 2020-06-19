#!/bin/sh

GRPC_TOOLS_NODE_PROTOC="./node_modules/.bin/grpc_tools_node_protoc"
GRPC_TOOLS_NODE_PROTOC_PLUGIN="./node_modules/.bin/grpc_tools_node_protoc_plugin"
PROTOC_GEN_TS_PATH="./node_modules/.bin/protoc-gen-ts"
 
PROTOS_DIR="protos"
OUT_DIR="./src/generated"
 
rm -rf $OUT_DIR
mkdir $OUT_DIR

for FILE in ${PROTOS_DIR}/*.proto
do
  ${GRPC_TOOLS_NODE_PROTOC} \
      -I="${PROTOS_DIR}" \
      --plugin="protoc-gen-grpc=${GRPC_TOOLS_NODE_PROTOC_PLUGIN}" \
      --js_out="import_style=commonjs,binary:${OUT_DIR}" \
      --grpc_out="${OUT_DIR}" \
      $FILE

  ${GRPC_TOOLS_NODE_PROTOC} \
      -I="${PROTOS_DIR}" \
      --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
      --ts_out="${OUT_DIR}" \
      $FILE
done