process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Users', () => {
  describe('/GET all users', () => {
    it('it should GET all the users', done => {
      chai
        .request(server)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(200);
          Object.keys(res.body).length.should.be.greaterThan(20);
          Object.keys(res.body[0]).should.include(
            'firstName',
            'lastName',
            'email'
          );
          done();
        });
    });
  });

  describe('/GET one user', () => {
    it('it should GET the user with the given id', done => {
      chai
        .request(server)
        .get('/users/1')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          Object.keys(res.body).should.include(
            'firstName',
            'lastName',
            'email'
          );
          res.body.email.should.equal('lwolfe@talentpath.com');
        });
      done();
    });

    it('it should not GET non-existing users', done => {
      chai
        .request(server)
        .get('/users/0')
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.empty; // Is this a meaningful assertion for a 404 res?
        });
      done();
    });
  });

  describe('/POST new user', () => {
    // This fails after the first time, unless the table is going to be dropped each time
    it('it should return a new user from req data', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstName: 'Norton',
          lastName: 'Juster',
          email: 'phantom@tollbooth.org',
          password: 'Tock',
        })
        .end((err, res) => {
          res.should.have.status(200);
          Object.keys(res.body).should.include('id', 'firstName');
          res.body.password.should.not.equal('Tock');
        });
      done();
    });

    it('it should return an error to a bad request', done => {
      chai
        .request(server)
        .post('/users')
        .send({
          firstname: 'Norton',
          lastName: 'Juster',
          email: 'phantom@tollbooth.org',
          password: 'Tock',
        })
        .end((err, res) => {
          res.should.have.status(500); // Should be updated to 400 in controller
        });
      done();
    });
  });

  describe('/PUT updated user', () => {
    it('it should be denied if not signed in', done => {
      chai
        .request(server)
        .put('/users/2')
        .send({
          firstName: 'LanceLanceLance',
          lastName: 'LanceLanceLance',
          email: 'LANCELANCELANCE',
          password: 'laaaaaaaaance',
        })
        .end((err, res) => {
          res.should.have.status(400);
        });
      done();
    });
  });

  it('it should be denied if signed in as different user', done => {
    const agent = chai.request.agent(server);
    agent
      .post('/signin')
      .send({ email: '007@mi6.gov', password: 'HerRoyalMajesty' })
      .then(res => {
        return agent
          .put('/users/2')
          .send({
            firstName: 'LanceLanceLance',
            lastName: 'LanceLanceLance',
            email: 'LANCELANCELANCE',
            password: 'laaaaaaaaance',
          })
          .then(res => {
            res.should.have.status(400);
          });
      });
    done();

    // Research correct way to handle session
    /* it('it should replace non-id details for a specified id', done => {
      const agent = chai.request.agent(server);
      agent
        .post('/signin')
        .send({ email: 'lance@lance.lance', password: 'LANCELANCELANCE' });
      chai
        .request(server)
        .put('/users/2')
        .send({
          firstName: 'LanceLanceLance',
          lastName: 'LanceLanceLance',
          email: 'LANCELANCELANCE',
          password: 'laaaaaaaaance',
        })
        .end((err, res) => {
          // will hit auth middleware
        });
      done();
    }); */
  });

  describe('/DELETE user', () => {});
});
