{ pkgs ? import <nixpkgs> {} }:
  pkgs.mkShell {
    nativeBuildInputs = with pkgs.buildPackages; [ nodejs_18 ];
    shellHook = ''
      npm install
    '';
}
