#!/bin/sh

PROTOC="yarn run grpc_tools_node_protoc"

PROTOS_DIR="./protos"
NODE_OUT_DIR="./src/node/generated"
WEB_OUT_DIR="./src/web/generated"
 
rm -rf $NODE_OUT_DIR
mkdir $NODE_OUT_DIR
 
rm -rf $WEB_OUT_DIR
mkdir $WEB_OUT_DIR

${PROTOC} \
    --js_out="import_style=commonjs,binary:${NODE_OUT_DIR}" \
    --ts_out="grpc_js:${NODE_OUT_DIR}" \
    --grpc_out="grpc_js:${NODE_OUT_DIR}" \
    -I="${PROTOS_DIR}" \
    ${PROTOS_DIR}/*.proto

${PROTOC} \
    --js_out="import_style=commonjs,binary:${WEB_OUT_DIR}" \
    --grpc-web_out="import_style=commonjs+dts,mode=grpcwebtext:${WEB_OUT_DIR}" \
    -I="${PROTOS_DIR}" \
    ${PROTOS_DIR}/*.proto
