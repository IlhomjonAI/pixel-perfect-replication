CREATE TABLE recycle_bin (id INTEGER PRIMARY KEY AUTOINCREMENT, resource TEXT NOT NULL, record_key TEXT NOT NULL, label TEXT NOT NULL, payload TEXT NOT NULL, deleted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE VIEW restore_bin AS SELECT * FROM recycle_bin;
CREATE TRIGGER archive_posts BEFORE DELETE ON posts BEGIN
 INSERT INTO recycle_bin(resource,record_key,label,payload) VALUES('posts',OLD.slug,OLD.title,json_object('slug',OLD.slug,'title',OLD.title,'category',OLD.category,'date',OLD.date,'excerpt',OLD.excerpt,'body',OLD.body,'cover_image',OLD.cover_image,'gallery',OLD.gallery,'is_demo',OLD.is_demo,'status',OLD.status,'version',OLD.version,'updated_at',OLD.updated_at));
END;
CREATE TRIGGER restore_posts INSTEAD OF DELETE ON restore_bin WHEN OLD.resource='posts' BEGIN
 INSERT INTO posts (slug,title,category,date,excerpt,body,cover_image,gallery,is_demo,status,version,updated_at) VALUES (json_extract(OLD.payload,'$.slug'),json_extract(OLD.payload,'$.title'),json_extract(OLD.payload,'$.category'),json_extract(OLD.payload,'$.date'),json_extract(OLD.payload,'$.excerpt'),json_extract(OLD.payload,'$.body'),json_extract(OLD.payload,'$.cover_image'),json_extract(OLD.payload,'$.gallery'),json_extract(OLD.payload,'$.is_demo'),json_extract(OLD.payload,'$.status'),json_extract(OLD.payload,'$.version')+1,json_extract(OLD.payload,'$.updated_at'));
 DELETE FROM recycle_bin WHERE id=OLD.id;
END;
CREATE TRIGGER archive_achievements BEFORE DELETE ON achievements BEGIN
 INSERT INTO recycle_bin(resource,record_key,label,payload) VALUES('achievements',OLD.id,OLD.title,json_object('id',OLD.id,'student_name',OLD.student_name,'class_at_achievement',OLD.class_at_achievement,'type',OLD.type,'title',OLD.title,'subject',OLD.subject,'stage',OLD.stage,'result',OLD.result,'achievement_date',OLD.achievement_date,'teacher_name',OLD.teacher_name,'certificate_image',OLD.certificate_image,'is_demo',OLD.is_demo,'status',OLD.status,'version',OLD.version,'updated_at',OLD.updated_at));
END;
CREATE TRIGGER restore_achievements INSTEAD OF DELETE ON restore_bin WHEN OLD.resource='achievements' BEGIN
 INSERT INTO achievements (id,student_name,class_at_achievement,type,title,subject,stage,result,achievement_date,teacher_name,certificate_image,is_demo,status,version,updated_at) VALUES (json_extract(OLD.payload,'$.id'),json_extract(OLD.payload,'$.student_name'),json_extract(OLD.payload,'$.class_at_achievement'),json_extract(OLD.payload,'$.type'),json_extract(OLD.payload,'$.title'),json_extract(OLD.payload,'$.subject'),json_extract(OLD.payload,'$.stage'),json_extract(OLD.payload,'$.result'),json_extract(OLD.payload,'$.achievement_date'),json_extract(OLD.payload,'$.teacher_name'),json_extract(OLD.payload,'$.certificate_image'),json_extract(OLD.payload,'$.is_demo'),json_extract(OLD.payload,'$.status'),json_extract(OLD.payload,'$.version')+1,json_extract(OLD.payload,'$.updated_at'));
 DELETE FROM recycle_bin WHERE id=OLD.id;
END;
CREATE TRIGGER archive_teachers BEFORE DELETE ON teachers BEGIN
 INSERT INTO recycle_bin(resource,record_key,label,payload) VALUES('teachers',OLD.slug,OLD.name,json_object('slug',OLD.slug,'name',OLD.name,'photo',OLD.photo,'subject',OLD.subject,'qualification',OLD.qualification,'education',OLD.education,'experience',OLD.experience,'biography',OLD.biography,'certificates',OLD.certificates,'is_demo',OLD.is_demo,'status',OLD.status,'version',OLD.version,'updated_at',OLD.updated_at,'certificate_images',OLD.certificate_images));
END;
CREATE TRIGGER restore_teachers INSTEAD OF DELETE ON restore_bin WHEN OLD.resource='teachers' BEGIN
 INSERT INTO teachers (slug,name,photo,subject,qualification,education,experience,biography,certificates,is_demo,status,version,updated_at,certificate_images) VALUES (json_extract(OLD.payload,'$.slug'),json_extract(OLD.payload,'$.name'),json_extract(OLD.payload,'$.photo'),json_extract(OLD.payload,'$.subject'),json_extract(OLD.payload,'$.qualification'),json_extract(OLD.payload,'$.education'),json_extract(OLD.payload,'$.experience'),json_extract(OLD.payload,'$.biography'),json_extract(OLD.payload,'$.certificates'),json_extract(OLD.payload,'$.is_demo'),json_extract(OLD.payload,'$.status'),json_extract(OLD.payload,'$.version')+1,json_extract(OLD.payload,'$.updated_at'),json_extract(OLD.payload,'$.certificate_images'));
 DELETE FROM recycle_bin WHERE id=OLD.id;
END;
CREATE TRIGGER archive_school_life BEFORE DELETE ON school_life BEGIN
 INSERT INTO recycle_bin(resource,record_key,label,payload) VALUES('school-life',OLD.id,OLD.title,json_object('id',OLD.id,'title',OLD.title,'description',OLD.description,'image',OLD.image,'is_demo',OLD.is_demo,'status',OLD.status,'category',OLD.category,'event_date',OLD.event_date,'gallery',OLD.gallery,'version',OLD.version,'updated_at',OLD.updated_at));
END;
CREATE TRIGGER restore_school_life INSTEAD OF DELETE ON restore_bin WHEN OLD.resource='school-life' BEGIN
 INSERT INTO school_life (id,title,description,image,is_demo,status,category,event_date,gallery,version,updated_at) VALUES (json_extract(OLD.payload,'$.id'),json_extract(OLD.payload,'$.title'),json_extract(OLD.payload,'$.description'),json_extract(OLD.payload,'$.image'),json_extract(OLD.payload,'$.is_demo'),json_extract(OLD.payload,'$.status'),json_extract(OLD.payload,'$.category'),json_extract(OLD.payload,'$.event_date'),json_extract(OLD.payload,'$.gallery'),json_extract(OLD.payload,'$.version')+1,json_extract(OLD.payload,'$.updated_at'));
 DELETE FROM recycle_bin WHERE id=OLD.id;
END;
CREATE TRIGGER archive_contact_messages BEFORE DELETE ON contact_messages BEGIN
 INSERT INTO recycle_bin(resource,record_key,label,payload) VALUES('messages',OLD.id,OLD.name,json_object('id',OLD.id,'name',OLD.name,'contact',OLD.contact,'type',OLD.type,'message',OLD.message,'created_at',OLD.created_at,'status',OLD.status,'consent_at',OLD.consent_at,'request_id',OLD.request_id,'version',OLD.version,'updated_at',OLD.updated_at,'telegram_username',OLD.telegram_username,'email',OLD.email));
END;
CREATE TRIGGER restore_contact_messages INSTEAD OF DELETE ON restore_bin WHEN OLD.resource='messages' BEGIN
 INSERT INTO contact_messages (id,name,contact,type,message,created_at,status,consent_at,request_id,version,updated_at,telegram_username,email) VALUES (json_extract(OLD.payload,'$.id'),json_extract(OLD.payload,'$.name'),json_extract(OLD.payload,'$.contact'),json_extract(OLD.payload,'$.type'),json_extract(OLD.payload,'$.message'),json_extract(OLD.payload,'$.created_at'),json_extract(OLD.payload,'$.status'),json_extract(OLD.payload,'$.consent_at'),json_extract(OLD.payload,'$.request_id'),json_extract(OLD.payload,'$.version')+1,json_extract(OLD.payload,'$.updated_at'),json_extract(OLD.payload,'$.telegram_username'),json_extract(OLD.payload,'$.email'));
 UPDATE telegram_outbox SET sent_at=CURRENT_TIMESTAMP WHERE contact_id=json_extract(OLD.payload,'$.id');
 DELETE FROM recycle_bin WHERE id=OLD.id;
END;
