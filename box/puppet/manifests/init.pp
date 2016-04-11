class { 'nginx':
	sendfile => 'off',
}

nginx::resource::vhost { 'localhost':
	www_root => '/var/src/client/public',
	listen_port => 5000,
}

class { 'nodejs':
  version      => 'stable',
  make_install => false,
}

package { 'grunt-cli':
	ensure   => present,
	provider => 'npm',
}

class {'::mongodb::server':
	port    => 27018,
	verbose => true,
}

include redis
