CREATE DATABASE OPRS;
USE OPRS;

CREATE TABLE user(
    user_id VARCHAR(64) NOT NULL PRIMARY KEY,
	full_name VARCHAR(100) NOT NULL,
	gender VARCHAR(6) NOT NULL,
	phone_number VARCHAR(20) NOT NULL,
	email VARCHAR(128) NOT NULL,
    zone VARCHAR(64) NOT NULL,
	woreda VARCHAR(64) NOT NULL,
	job_type VARCHAR(64) NOT NULL,
    photo_url TEXT NOT NULL,
	date_joined DATETIME NOT NULL,
    age INTEGER NOT NULL,
	STATUS INTEGER DEFAULT 2000,
	region VARCHAR(64) NOT NULL,
	married bool NOT NULL
);

ALTER TABLE user ADD CONSTRAINT email_constraint UNIQUE(email);

CREATE TABLE user_auth(
	user_id  VARCHAR(64) NOT NULL PRIMARY KEY,
	auth_string  VARCHAR(128) NOT NULL,
	user_role INTEGER DEFAULT 1000,
	foreign key (user_id) references user(user_id) on delete CASCADE on update CASCADE
);

CREATE TABLE sessions(
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    user_role INTEGER,
    user_agent TEXT NOT NULL,
    user_ip VARCHAR(64) NOT NULL DEFAULT 'UNDEFINED',
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) on delete CASCADE on update CASCADE
);


CREATE TABLE verification_keys (
    verification_id SERIAL,
    user_id VARCHAR(64) NOT NULL,
    verification_key INT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE listing(
    listing_id VARCHAR(64) NOT NULL PRIMARY KEY,
    owner_id VARCHAR(64) NOT NULL,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    sub_city VARCHAR(20) NOT NULL,
    woreda VARCHAR(20) NOT NULL,
    area_name VARCHAR(64) NOT NULL,
    latLng VARCHAR(200) NOT NULL,
    price_per_duration VARCHAR(7) NOT NULL,
    payment_currency VARCHAR(10) NOT NULL,
    tax_responsibility VARCHAR(64) NOT NULL,
    building_name VARCHAR(64) NOT NULL,
    furnished VARCHAR(10) NOT NULL,
    total_area_square_meter INTEGER NOT NULL,
    status INTEGER NOT NULL DEFAULT 1000,
    distance_from_road_in_meters INTEGER DEFAULT 0,
    customer_service_desks INTEGER DEFAULT 0,
    lease_duration_days INTEGER DEFAULT 0,
    number_of_bathrooms INTEGER DEFAULT 0,
    number_of_bedrooms INTEGER DEFAULT 0,
    number_of_kitchens INTEGER DEFAULT 0,
    security_guards INTEGER DEFAULT 0,
    catering_rooms INTEGER DEFAULT 0,
    floor_number INTEGER DEFAULT 0,
    back_stages INTEGER DEFAULT 0,
    backrooms INTEGER DEFAULT 0,
    displays INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    storage_capacity_square_meter INTEGER DEFAULT 0,
    parking_capacity INTEGER DEFAULT 0,
    ceiling_height_in_meter INTEGER DEFAULT 0,
    number_of_floors INTEGER DEFAULT 0,
    loading_docks INTEGER DEFAULT 0,
    guest_capacity INTEGER DEFAULT 0,
    FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE amenities(
    id SERIAL NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    name VARCHAR(64) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE describing_terms(
    id SERIAL NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    term VARCHAR(64) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE listing_photos(
    id SERIAL NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE socials(
    user_id VARCHAR(64) NOT NULL,
    id SERIAL NOT NULL,
    social VARCHAR(64) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reviews(
    review_id SERIAL NOT NULL,
    author_id VARCHAR(64) NOT NULL,
    review_date DATETIME NOT NULL,
    review_message TEXT NOT NULL,
    rating VARCHAR(64) NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    FOREIGN KEY (listing_id) REFERENCES listing(listing_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (author_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE payment_info(
    user_id VARCHAR(64) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    sub_account_id VARCHAR(64) NOT NULL PRIMARY KEY,
    business_name VARCHAR(100) NOT NULL,
    account_owner_name VARCHAR(64) NOT NULL,
    bank_id VARCHAR(64) NOT NULL,
    bank_name VARCHAR(64) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

  
CREATE TABLE reservation(
    reservation_id VARCHAR(64) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    owner_id VARCHAR(64) NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    status INTEGER DEFAULT 2000,
    selected_payment_method VARCHAR(64) NOT NULL,
    date DATETIME NOT NULL,
    price_offer INTEGER DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE stay_dates(
    id SERIAL NOT NULL,
    reservation_id VARCHAR(64) NOT NULL PRIMARY KEY,
    stay_date DATETIME NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservation(reservation_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE agreement(
    agreement_id VARCHAR(64) NOT NULL PRIMARY KEY,
    tenant_id VARCHAR(64) NOT NULL,
    owner_id VARCHAR(64) NOT NULL,
    listing_id VARCHAR(64) NOT NULL,
    lease_start_date INTEGER NOT NULL,
    lease_end_date INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE notification(
    notification_id VARCHAR(64) NOT NULL,
    initiator_id VARCHAR(64) NOT NULL,
    receiver_id VARCHAR(64) NOT NULL,
    type VARCHAR(10) NOT NULL,
    title VARCHAR(50) NOT NULL,
    viewed BOOLEAN DEFAULT FALSE,
    body TEXT NOT NULL,
    date DATETIME NOT NULL,
    FOREIGN KEY (initiator_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE passwords(
    id SERIAL,
    user_id VARCHAR(64) NOT NULL,
    pass VARCHAR(64) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE ON UPDATE CASCADE
);