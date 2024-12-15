-- SQLite
DROP TABLE IF EXISTS Attachments;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Geolocation;
DROP TABLE IF EXISTS Documents;
DROP TABLE IF EXISTS Geolocation_Documents;
DROP TABLE IF EXISTS OriginalResources;
DROP TABLE IF EXISTS Stakeholders;
DROP TABLE IF EXISTS Document_Stakeholder;
DROP TABLE IF EXISTS DocumentTypes;
DROP TABLE IF EXISTS Type;


CREATE TABLE "Connections" (
	"parent_id"	INTEGER,
	"children_id"	INTEGER,
	"connection_type"	VARCHAR(50),
	PRIMARY KEY("parent_id","children_id", "connection_type"),
	FOREIGN KEY("parent_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("children_id") REFERENCES "Nodes"("node_id"),
	FOREIGN KEY("parent_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE,
	FOREIGN KEY("children_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);

CREATE TABLE "Document_Stakeholder" (
	"stakeholder_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	"id"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("stakeholder_id") REFERENCES "Stakeholders"("stakeholder_id"),
	UNIQUE("document_id","stakeholder_id")
);

CREATE TABLE "Documents" (
	"document_id"	INTEGER,
	"document_title"	VARCHAR(255) NOT NULL,
	"scale"	VARCHAR(50) NOT NULL,
	"issuance_date"	DATE NOT NULL,
	"language"	VARCHAR(50),
	"pages"	INT,
	"document_type"	VARCHAR(50) NOT NULL,
	"document_description"	TEXT NOT NULL,
	PRIMARY KEY("document_id" AUTOINCREMENT)
	);


CREATE TABLE "Geolocation" (
	"area_id"	INTEGER NOT NULL,
	"long"	REAL NOT NULL,
	"lat"	REAL NOT NULL,
	"n_order" INTEGER NOT NULL DEFAULT 0,
	"sub_area_id" INTEGER,
	"area_name"	TEXT NOT NULL DEFAULT ' '
);

CREATE TABLE "Geolocation_Documents" (
	"area_id"	INTEGER NOT NULL,
	"document_id"	INTEGER NOT NULL,
	PRIMARY KEY("area_id","document_id"),
	FOREIGN KEY("area_id") REFERENCES "Geolocation"("area_id"),
	FOREIGN KEY("document_id") REFERENCES "Documents"("document_id") ON DELETE CASCADE
);


CREATE TABLE "Stakeholders" (
	"stakeholder_id"	INTEGER,
	"stakeholder_name"	INTEGER NOT NULL,
	PRIMARY KEY("stakeholder_id" AUTOINCREMENT)
);

CREATE TABLE "Type" (
	"type_id"	INTEGER,
	"type_name"	VARCHAR(50) NOT NULL,
	PRIMARY KEY("type_id" AUTOINCREMENT)
);

INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(1, 'LKAB');
INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(2, 'Citizens');
INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(3, 'Hospital');
INSERT INTO Stakeholders(stakeholder_id, stakeholder_name) VALUES(4, 'Assurance');


INSERT INTO Documents (document_id, document_title, scale, issuance_date, language, pages, document_type, document_description) VALUES
(1, 'Kiruna buildings', '1:100', '2012', 'Swedish', 10, 'Technical', 'description'),
(2, 'Kiruna workshops', '1:1000', '2012/12/25', 'English', 10, 'Technical', 'description'),
(3, 'LKAB Policy', '1:1000', '2012/12/25', 'English', 10, 'Technical', 'description'),
(4, 'Municipal Assurance', '1:1000', '2012/12/25', 'English', 10, 'Technical', 'description'),
(5, 'LKAB Assurance', '1:1000', '2012/12/25', 'English', 10, 'Technical', 'description'),
(7, 'LKAB Policy 1', '1:100', '2012/12/05', 'Swedish', 2, 'Technical', 'TEEST'),
(8, 'Adjusted development plan', '1:100', '2024/11/20', 'English', 0, 'Agreement', 'description'),
(9, 'Miners Assurance', '1:100', '2024/11/03', 'Swedish', 5, 'Conflict', 'Miners Assurance'),
(10, 'Agreements 2024', '1:100', '2012/12/05', 'English - Advanced', 5, 'Agreement', 'ciao'),
(11, 'Church Consultation', '1:100', '2012/12/05', 'Swedish', 2, 'Consultation', 'prova'),
(12, 'Inside Kiruna', '1:100', '2012/12/05', 'Swedish', 2, 'Prescriptive', 'test'),
(13, 'Alpha Industries', 'Blueprint', '2020/12', 'English', 49, 'Material Effects', 'Test'),
(14, 'Alpha Assurance 1', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance'),
(15, 'Alpha Assurance 2', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance'),
(16, 'Alpha Assurance 3', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance'),
(17, 'Alpha Assurance 4', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance'),
(18, 'Alpha Assurance 5', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance'),
(19, 'Alpha Assurance 6', '1:100', '2020', 'Swedish', 5, 'Agreement', 'Alpha Assurance');

INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,1);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(2,1);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(2,2);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(2,3);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,4);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,5);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,6);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,7);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,8);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,9);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,10);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,11);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,12);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,13);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,14);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,15);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,16);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,17);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,18);
INSERT INTO Document_Stakeholder(stakeholder_id, document_id) VALUES(1,19);

INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 1);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 2);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 3);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 4);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 5);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 6);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 7);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 8);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 9);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 10);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 11);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 12);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 13);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 14);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 15);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 16);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 17);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 18);
INSERT INTO Geolocation_Documents(area_id, document_id) VALUES(1, 19);

INSERT INTO Type (type_name) VALUES ('Design');
INSERT INTO Type (type_name) VALUES ('Informative');
INSERT INTO Type (type_name) VALUES ('Technical');
INSERT INTO Type (type_name) VALUES ('Prescriptive');
INSERT INTO Type (type_name) VALUES ('Material Effects');
INSERT INTO Type (type_name) VALUES ('Agreement');
INSERT INTO Type (type_name) VALUES ('Conflict');
INSERT INTO Type (type_name) VALUES ('Consultation');
