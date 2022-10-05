#!/bin/sh

# Copy service file, incase if there are any changes
sudo cp baconbot2.service /etc/systemd/system/baconbot2.service

# reload configurations incase if service file has changed
sudo systemctl daemon-reload
