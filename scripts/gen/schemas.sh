#!/usr/bin/env bash
set -e

. "scripts/_common.sh"

declare -a schemas=(
	"src/interfaces/config.ts config config/config.schema.json"
)

main() {
	for schema in "${schemas[@]}"; do
		IFS=' ' read interface type output <<< "$schema"
		bun x ts-json-schema-generator \
			--path "$interface" \
			--type "$type" \
			--tsconfig tsconfig.json \
			-o "$output"
	done
}

main
