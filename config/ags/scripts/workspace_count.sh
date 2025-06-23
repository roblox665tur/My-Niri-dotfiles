#!/bin/bash

# Provides a count of workspaces
#
#
niri msg workspaces | wc -l | awk '{print $1 -1}'
