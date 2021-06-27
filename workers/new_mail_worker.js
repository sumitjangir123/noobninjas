const queue= require('../config/kue');
const fornewmail= require('../mailers/new_mail');

queue.process('FormailQueue',function(job,done){
    console.log('new mail worker is processing a job ',job.data);
    fornewmail.newmail1(job.data);
    done();
});