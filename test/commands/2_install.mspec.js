'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var rimraf = require('rimraf');
var sinon = require('sinon');
var semver = require('semver');
var MockProgram = require('../mocks/program');
var InstallCommand = require('../../commands/install');

describe('install command', function () {
	var installCommand, program; // eslint-disable-line

	beforeEach(function () {
		program = new MockProgram();
		installCommand = new InstallCommand(program);
	});

	it('should install a bundle and its dependencies', function () {
		this.timeout(40000);
		program.runWith('install supportclass/lfg-streamtip');
		assert.equal(fs.existsSync('./bundles/lfg-streamtip/package.json'), true);
		assert.isAbove(fs.readdirSync('./bundles/lfg-streamtip/node_modules').length, 0);
		assert.isAbove(fs.readdirSync('./bundles/lfg-streamtip/bower_components').length, 0);
	});

	it('should install a version that satisfies a provided semver range', function () {
		this.timeout(40000);
		program.runWith('install supportclass/lfg-nucleus#^1.1.0');
		assert.equal(fs.existsSync('./bundles/lfg-nucleus/package.json'), true);

		var pjson = JSON.parse(fs.readFileSync('./bundles/lfg-nucleus/package.json'));
		assert.isTrue(semver.satisfies(pjson.version, '^1.1.0'));
	});

	it('should install bower & npm dependencies when run with no arguments in a bundle directory', function () {
		this.timeout(40000);

		rimraf.sync('./bundles/lfg-streamtip/node_modules');
		rimraf.sync('./bundles/lfg-streamtip/bower_components');

		process.chdir('./bundles/lfg-streamtip');
		program.runWith('install');
		assert.isAbove(fs.readdirSync('./node_modules').length, 0);
		assert.isAbove(fs.readdirSync('./bower_components').length, 0);
	});

	it('should print an error when no valid git repo is provided', function () {
		this.timeout(20000);
		sinon.spy(console, 'error');
		program.runWith('install 123');
		assert.equal('Please enter a valid git repository URL or GitHub username/repo pair.',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});
});
