#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'
alias l.='ls -d .* --color=auto'
alias ll='ls -l --color=auto'
alias lss='du -ah --max-depth 1'

# 	MY SETTINGS
#
#
umask 0002
export HISTCONTROL=ignoredups

#PS1='\[\033[33m\]\W\[\e[0m\] \[\033[31m\]➜ \[\033[0m\] \$ '


PS1="\[\e[1;33m\]\[\033[34m\]\n\[\033[1;34m\] 󰣇 \[\e[1;37m\] \W \[\e[1;36m\]\[\e[0;37m\] "

export PS1

# bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
eval "$(starship init bash)"
