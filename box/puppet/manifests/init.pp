class { 'nginx':
	sendfile => 'off',
}

nginx::resource::vhost { 'localhost':
	www_root => '/var/src/client/public',
	listen_port => 5000,
}

include nodejs

package { 'grunt-cli':
	ensure   => present,
	provider => 'npm',
}

class {'::mongodb::server':
	port    => 27018,
	verbose => true,
}

class { 'redis':
	version => '2.8.19',
	redis_bind_address => '127.0.0.1',
	redis_max_memory   => '200mb',
}