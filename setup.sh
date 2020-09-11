#!/usr/bin/env sh

set -xeu

# Install Docker

amazon-linux-extras install docker -y
systemctl enable docker
systemctl start docker

# Start the Docker container

docker run \
    --interactive \
    --tty \
    --detach \
    --restart always \
    --name quake \
    --volume /pak0.pk3:/pak0.pk3:ro \
    --volume /server.cfg:/home/ioq3srv/ioquake3/baseq3/server.cfg \
    --publish 0.0.0.0:27960:27960/udp \
    jberrenberg/quake3 \
    +exec server.cfg

# Create a user with a custom shell that attaches to the container on login

shell=/home/quake/attach
useradd --groups docker --shell $shell quake
cp -a ~ec2-user/.ssh ~quake/.ssh
chown -R quake:quake ~quake/.ssh

cat > $shell <<EOF
#!/usr/bin/env sh
echo "Type CTRL-p then CTRL-q to exit"
exec docker attach quake
EOF
chmod +x $shell
echo $shell >> /etc/shells
