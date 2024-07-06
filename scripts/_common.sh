#!/bin/env bash
set -e

run() {
	printf "\e[30m\$ %s\e[0m\n" "$*"
	$@
}
