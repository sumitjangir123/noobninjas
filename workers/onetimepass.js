const queue= require('../config/kue');
const newOrgMailer= require('../mailers/new_user');

queue.process('userQueue',function(job,done){
    console.log('new user worker is processing a job ',job.data);
    newOrgMailer.user1(job.data);
    done();
});