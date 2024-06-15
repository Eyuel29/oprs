INSERT INTO user(full_name, gender,phone_number,email,zone,woreda,job_type,region,age,account_status,married, user_role)VALUES
('Eyuel Dejene','male',251958031425,'fnmnqxnsdh@gmail.com','KOLFE KERANIO','01','Account','Addis Ababa',30,3000,false, 3000),
('Abebe Kebede','male',251906212658,'xyusnzlcot@gmail.com','BOLE','01','Account','Addis Ababa',30,3000,false, 1000),
('Eyuel Dejene','male',251986725521,'ajwijnkcat@gmail.com','GULELE','01','Account','Addis Ababa',30,3000,false, 2000),
('Muluken Mengistu','male',251974207517,'rggvztqjty@gmail.com','ARADA','01','Account','Addis Ababa',30,3000,false, 1000),
('Melkam Mickiael','female',251933505531,'zhjwiyqwtl@gmail.com','KOLFE KERANIO','01','Account','Addis Ababa',30,3000,false, 2000),
('Ezana Mulgeta','male',251924544077,'dmlstactar@gmail.com','KOLFE KERANIO','01','Account','Addis Ababa',30,3000,false, 3000),
('Foziya Abdella','female',251918206188,'wtzyljwkbw@gmail.com','KIRKOS','01','Account','Addis Ababa',30,3000,false, 2000),
('Admasu Biruk','male',251917237771,'kvouhvmwjd@gmail.com','ADDIS KETEMA','01','Account','Addis Ababa',30,3000,false, 1000),
('Edris Fereja','male',251946733317,'ilpjhsxrtb@gmail.com','ARADA','01','Account','Addis Ababa',30,3000,false, 2000),
('Anteneh Girma','male',251917873802,'jagtdlhrwb@gmail.com','ADDIS KETEMA','01','Account','Addis Ababa',30,3000,false, 1000);

INSERT INTO passwords(user_id, pass) VALUES
(1 ,'usxbmnly'),
(2 ,'nneuvmlf'),
(3 ,'aywdnldt'),
(4 ,'cwumjhea'),
(5 ,'hfhhtgsx'),
(6 ,'qmjksifv'),
(7 ,'jfisoihk'),
(8 ,'ycpzpjbk'),
(9 ,'suypgxgr'),
(10,'zavkbinq');

INSERT INTO user_auth(user_id,auth_string)VALUES
(1 ,'$2b$08$djAqs8v1OQOn69oQfr2sVObH/gJQcjp07TYsQfbtg6B3IaoLN6sUK'),
(2 ,'$2b$08$vRbtb4Sa57/S/56JttTXoeerjqcYUdRgrxSb1RWKsiEiFQXrKsA/2'),
(3 ,'$2b$08$f3qKGV5QsX.xTy.pJlEWKO2x3tYr3yqbi3iG1Wjl37oJdVarBs4.e'),
(4 ,'$2b$08$sztBIhIw2bvvtHatf1y4puSzP2ThQGiDfXLhc9sqLFBJHBziC.qqK'),	
(5 ,'$2b$08$XtUgKT2SypapF7y4242Eq.I.9fswSPpdDgPF3jr1Jey7UXT42uTXy'),
(6 ,'$2b$08$BTV/v9e6MjcmvxvDz.A.geWATVFSqo9b/iTkhE4.5CoRizXCgtAzy'),
(7 ,'$2b$08$gHy1sPY1RnHbLuS7OJ4MdO6EAOatzFIU05uxK8vrB.IlmJpXYZeUO'),
(8 ,'$2b$08$KeqEZwwJTytDC2.73Lmgr.h2EQLhr.wiILYqqqUZUXE2W0eNhcRm2'),
(9 ,'$2b$08$kxqXnHP8DhMsM4aq7bQupOhZw9vV7TJD9wAw6.Srha.SR90ikMOVq'),
(10,'$2b$08$8PGBiQ9v9ktQdjPGoWWmUeibO7ePVSVCnrh5NV5lqeiyhEJ1VgNkC');

INSERT INTO user_photos(user_id, url) VALUES
(1 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(2 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(3 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(4 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(5 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(6 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(7 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(8 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(9 ,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600'),
(10,'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=600');

INSERT INTO payment_info(sub_account_id,user_id,account_number,business_name,account_owner_name,bank_id,bank_name)
VALUES('9618cdc3-74db-45d2-888f-5755d079e885',3,'0991109603','Joel Apartments','Eyuel Dejene','853d0598-9c01-41ab-ac99-48eab4da1513','telebirr'),
('f1d4ab12-a834-487f-97c6-e9f2e36b373c',5,'0968658459','Ezana Apartments','Ezana Mulgeta','853d0598-9c01-41ab-ac99-48eab4da1513','telebirr'),
('a9dbdf67-603e-4b75-bab3-884cca206ee5',7,'1000433229607','Eyuel Guest house','Edris Fereja','96e41186-29ba-4e30-b013-2ca36d7e7025','Commercial Bank of Ethiopia (CBE)');

select user.email, user.user_id, passwords.pass from user left join passwords on user.user_id = passwords.user_id;

