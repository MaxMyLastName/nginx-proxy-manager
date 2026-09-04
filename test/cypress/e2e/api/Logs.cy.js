/// <reference types="cypress" />

// backendApiGet's default error-detection treats any response with an object-typed
// `error` key as a failure, including arrays - which collides with the logs endpoint's
// `{access: [], error: []}` shape. returnOnError skips that heuristic so a successful
// empty error log doesn't get misread as a request failure.
describe('Host Logs endpoints', () => {
	let token;

	// Other spec files reset all users (and so leave these hosts owned by a
	// deleted user) before running their own list/expand=owner assertions,
	// which then fail schema validation on the orphaned owner reference.
	// Clean up everything this spec creates so it doesn't outlive its admin.
	const created = {};

	before(() => {
		cy.resetUsers();
		cy.getToken().then((tok) => {
			token = tok;
		});
	});

	after(() => {
		if (created.proxyHostId) {
			cy.task('backendApiDelete', { token, path: `/api/nginx/proxy-hosts/${created.proxyHostId}` });
		}
		if (created.deadHostId) {
			cy.task('backendApiDelete', { token, path: `/api/nginx/dead-hosts/${created.deadHostId}` });
		}
		if (created.redirectionHostId) {
			cy.task('backendApiDelete', { token, path: `/api/nginx/redirection-hosts/${created.redirectionHostId}` });
		}
		if (created.streamId) {
			cy.task('backendApiDelete', { token, path: `/api/nginx/streams/${created.streamId}` });
		}
		if (created.rbacProxyHostId) {
			cy.task('backendApiDelete', { token, path: `/api/nginx/proxy-hosts/${created.rbacProxyHostId}` });
		}
		if (created.restrictedUserId) {
			cy.task('backendApiDelete', { token, path: `/api/users/${created.restrictedUserId}` });
		}
	});

	it('Should be able to get log preview for a Proxy Host', () => {
		cy.task('backendApiPost', {
			token: token,
			path:  '/api/nginx/proxy-hosts',
			data:  {
				domain_names:   ['logs-proxy.example.com'],
				forward_scheme: 'http',
				forward_host:   '1.1.1.1',
				forward_port:   80,
				access_list_id: '0',
				certificate_id: 0,
				meta:           {
					dns_challenge: false
				},
				advanced_config:         '',
				locations:               [],
				block_exploits:          false,
				caching_enabled:         false,
				allow_websocket_upgrade: false,
				http2_support:           false,
				hsts_enabled:            false,
				hsts_subdomains:         false,
				ssl_forced:              false
			}
		}).then((host) => {
			cy.validateSwaggerSchema('post', 201, '/nginx/proxy-hosts', host);
			created.proxyHostId = host.id;

			cy.task('backendApiGet', {
				token:         token,
				path:          `/api/nginx/proxy-hosts/${host.id}/logs`,
				returnOnError: true
			}).then((data) => {
				cy.validateSwaggerSchema('get', 200, '/nginx/proxy-hosts/{hostID}/logs', data);
				expect(data.access).to.be.an('array');
				expect(data.error).to.be.an('array');
			});
		});
	});

	it('Should be able to get log preview for a 404 Host', () => {
		cy.task('backendApiPost', {
			token: token,
			path:  '/api/nginx/dead-hosts',
			data:  {
				domain_names:     ['logs-dead.example.com'],
				certificate_id:   0,
				ssl_forced:       false,
				advanced_config:  '',
				http2_support:    false,
				hsts_enabled:     false,
				hsts_subdomains:  false,
				meta:             {}
			}
		}).then((host) => {
			cy.validateSwaggerSchema('post', 201, '/nginx/dead-hosts', host);
			created.deadHostId = host.id;

			cy.task('backendApiGet', {
				token:         token,
				path:          `/api/nginx/dead-hosts/${host.id}/logs`,
				returnOnError: true
			}).then((data) => {
				cy.validateSwaggerSchema('get', 200, '/nginx/dead-hosts/{hostID}/logs', data);
				expect(data.access).to.be.an('array');
				expect(data.error).to.be.an('array');
			});
		});
	});

	it('Should be able to get log preview for a Redirection Host', () => {
		cy.task('backendApiPost', {
			token: token,
			path:  '/api/nginx/redirection-hosts',
			data:  {
				domain_names:         ['logs-redirect.example.com'],
				forward_domain_name:  'example.com',
				forward_scheme:       'auto',
				forward_http_code:    301,
				preserve_path:        false,
				block_exploits:       false,
				certificate_id:       0,
				ssl_forced:           false,
				http2_support:        false,
				hsts_enabled:         false,
				hsts_subdomains:      false,
				advanced_config:      '',
				meta:                 {}
			}
		}).then((host) => {
			cy.validateSwaggerSchema('post', 201, '/nginx/redirection-hosts', host);
			created.redirectionHostId = host.id;

			cy.task('backendApiGet', {
				token:         token,
				path:          `/api/nginx/redirection-hosts/${host.id}/logs`,
				returnOnError: true
			}).then((data) => {
				cy.validateSwaggerSchema('get', 200, '/nginx/redirection-hosts/{hostID}/logs', data);
				expect(data.access).to.be.an('array');
				expect(data.error).to.be.an('array');
			});
		});
	});

	it('Should be able to get log preview for a Stream', () => {
		cy.task('backendApiPost', {
			token: token,
			path:  '/api/nginx/streams',
			data:  {
				incoming_port:    1510,
				forwarding_host:  '127.0.0.1',
				forwarding_port:  80,
				certificate_id:   0,
				meta:             {},
				tcp_forwarding:   true,
				udp_forwarding:   false
			}
		}).then((host) => {
			cy.validateSwaggerSchema('post', 201, '/nginx/streams', host);
			created.streamId = host.id;

			cy.task('backendApiGet', {
				token:         token,
				path:          `/api/nginx/streams/${host.id}/logs`,
				returnOnError: true
			}).then((data) => {
				cy.validateSwaggerSchema('get', 200, '/nginx/streams/{streamID}/logs', data);
				expect(data.access).to.be.an('array');
				expect(data.error).to.be.an('array');
			});
		});
	});

	it('Should not be able to get log preview for a Proxy Host without permission', () => {
		cy.task('backendApiPost', {
			token: token,
			path:  '/api/nginx/proxy-hosts',
			data:  {
				domain_names:   ['logs-proxy-rbac.example.com'],
				forward_scheme: 'http',
				forward_host:   '1.1.1.1',
				forward_port:   80,
				access_list_id: '0',
				certificate_id: 0,
				meta:           {
					dns_challenge: false
				},
				advanced_config:         '',
				locations:               [],
				block_exploits:          false,
				caching_enabled:         false,
				allow_websocket_upgrade: false,
				http2_support:           false,
				hsts_enabled:            false,
				hsts_subdomains:         false,
				ssl_forced:              false
			}
		}).then((host) => {
			cy.validateSwaggerSchema('post', 201, '/nginx/proxy-hosts', host);
			created.rbacProxyHostId = host.id;

			cy.task('backendApiPost', {
				token: token,
				path:  '/api/users',
				data:  {
					name:     'Logs Restricted User',
					nickname: 'LogsRestricted',
					email:    'logs-restricted@example.com',
					roles:    [],
					auth:     {
						type:   'password',
						secret: 'changeme'
					}
				}
			}).then((user) => {
				cy.validateSwaggerSchema('post', 201, '/users', user);
				created.restrictedUserId = user.id;

				cy.task('backendApiPut', {
					token: token,
					path:  `/api/users/${user.id}/permissions`,
					data:  {
						visibility:         'user',
						access_lists:       'hidden',
						dead_hosts:         'hidden',
						proxy_hosts:        'hidden',
						redirection_hosts:  'hidden',
						streams:            'hidden',
						certificates:       'hidden'
					}
				}).then((result) => {
					cy.validateSwaggerSchema('put', 200, '/users/{userID}/permissions', result);
					expect(result).to.equal(true);

					cy.task('backendApiPost', {
						path: '/api/tokens',
						data: {
							identity: 'logs-restricted@example.com',
							secret:   'changeme'
						}
					}).then((tokenResponse) => {
						// A "hidden" resource permission 404s rather than 403s on every
						// route for that resource (list/enable/logs alike) - this is
						// existing platform behaviour, not specific to the logs endpoint.
						cy.task('backendApiGet', {
							token:         tokenResponse.token,
							path:          `/api/nginx/proxy-hosts/${host.id}/logs`,
							returnOnError: true
						}).then((data) => {
							expect(data).to.have.property('error');
							expect(data.error).to.have.property('code', 404);
						});
					});
				});
			});
		});
	});

});
