#!/bin/bash

# Show active workspace
#
niri msg workspaces | grep '*' | awk '{print $2}' | tr -d '"'
