class { 'nginx':
  sendfile => 'off',
}

nginx::resource::vhost { 'localhost':
  www_root => '/var/src/client/public',
}

include nodejs

package { 'grunt-cli':
  ensure   => present,
  provider => 'npm',
}