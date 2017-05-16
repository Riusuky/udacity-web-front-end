// Functions
/*
locationFinder() returns an array of every location string from the JSONs
written for bio, education, and work.
*/
function locationFinder() {
    var locations = [];

    if (bio.contacts && bio.contacts.locationCoordinates) {
        locations.push({
            coordinates: bio.contacts.locationCoordinates,
            description: "<strong class=\"text-green\">Where I live: </strong>" + bio.contacts.location
        });
    }

    if (education.schools) {
        education.schools.forEach(function(school) {
            if (school.locationCoordinates) {
                locations.push({
                    coordinates: school.locationCoordinates,
                    description: "<strong class=\"text-green\">Where I've studied: </strong>" + school.location
                });
            }
        });
    }

    if (work.jobs) {
        work.jobs.forEach(function(job) {
            if (job.locationCoordinates) {
                locations.push({
                    coordinates: job.locationCoordinates,
                    description: "<strong class=\"text-green\">Where I've worked: </strong>" + job.location
                });
            }
        });
    }

    return locations;
}


// Bio templates
var skillTemplate = '<div class="skill-container">' +
    '<div class="skill-entry-base">' +
    '<p class="skill-entry">%skillName% <span class="score-entry">%skillScore%/5</span></p>' +
    '</div>' +
    '<div class="skill-entry-fill score-%skillScore%">' +
    '<p class="skill-entry">%skillName% <span class="score-entry">%skillScore%/5</span></p>' +
    '</div>' +
    '<div class="skill-score score-5"></div>' +
    '<div class="skill-score score-4"></div>' +
    '<div class="skill-score score-3"></div>' +
    '<div class="skill-score score-2"></div>' +
    '<div class="skill-score score-1"></div>' +
    '</div>';

var contactMobileTemplate = '<li class="mobile-field"><span class="label">mobile</span> <span class="entry">%data%</span></li>';
var contactEmailTemplate = '<li class="email-field"><span class="label">emal</span> <span class="entry">%data%</span></li>';
var contactGithubTemplate = '<li class="github-field"><span class="label">github</span> <span class="entry">%data%</span></li>';
var contactTwitterTemplate = '<li class="twitter-field"><span class="label">twitter</span> <span class="entry">%data%</span></li>';
var contactLocationTemplate = '<li class="location-field"><span class="label">location</span> <span class="entry">%data%</span></li>';


// Education templater
var educationTemplate = '<article class="owner-education-entry">' +
    '<h4><a class="name-entry" href="%url%" target="_blank">%name%</a></h4>' +

    '<p class="date-and-location text-middle-gray">' +
    '<span class="date-entry">%date%</span>' +
    '<span class="location-entry">%location%</span>' +
    '</p>' +

    '<p class="majors">Majors: <span class="major-entries">%majors%</span></p>' +
    '</article>';

var onlineEducationTemplate = '<article class="owner-online-education-entry">' +
    '<h4><a class="name-entry" href="%url%"  target="_blank">%name%</a></>' +

    '<p class="date-entry text-middle-gray">%date%</p>' +
    '</article>';


// Work experience
var workExperienceTemplate = '<article class="work-experience-entry">' +
    '<h4 class="name-entry">%name%</h4>' +

    '<p class="date-and-location text-middle-gray">' +
    '<span class="date-entry">%date%</span>' +
    '<span class="location-entry">%location%</span>' +
    '</p>' +

    '<p class="description-entry">%description%</p>' +
    '</article>';


// Projects
var projectTemplate = '<article class="project-entry">' +
    '<h4 class="name-entry">%name%</h4>' +

    '<p class="date-entry text-middle-gray">%date%</p>' +

    '<p class="description-entry">%description%</p>' +

    '<div class="project-images">' +
    '</div>' +
    '</article>';

var projectImageTemplate = '<figure class="image-container"><img class="image-entry" src="%url%" alt="Project image"></figure>';


var bio = {
    name: "Robert Rodent",
    role: "Dimension architect",
    contacts: {
        mobile: "+7D 0231-0342",
        email: "time_bender_32@ratmail.7d",
        github: "MageBuilder",
        twitter: "@MageBuilder",
        location: "Squirrel Town",
        locationCoordinates: "45.677180, -81.886085"
    },
    welcomeMessage: "You will not regret hiring me!",
    skills: [
        "Time Expansion",
        "Space Bending",
        "Fire Manipulation",
        "Sword Fighting"
    ],
    skillScores: [
        5,
        4,
        2,
        1
    ],
    biopic: "img/Robert.jpg",
    display: function() {
        $('.owner-name').text(this.name);
        $('.owner-role').text(this.role);

        var photoContainer = $('.owner-photo');
        photoContainer.attr('src', this.biopic);
        photoContainer.show();

        $('.owner-welcome').text(this.welcomeMessage);

        var skillScoresObject = this.skillScores;

        if (this.skills && (this.skills.length > 0)) {
            this.skills.forEach(function(element, index) {

                var skillEntry = skillTemplate.replace(/%skillName%/g, element).replace(/%skillScore%/g, skillScoresObject[index]);

                $('#skills').append($(skillEntry));
            });
        } else {
            $('#skills').hide();
        }

        var contactContainer = $('.contact-entries');

        if (this.contacts.mobile) {
            var mobileEntry = $(contactMobileTemplate.replace(/%data%/g, this.contacts.mobile));

            contactContainer.append(mobileEntry);
        }
        if (this.contacts.email) {
            var emailEntry = $(contactEmailTemplate.replace(/%data%/g, this.contacts.email));

            contactContainer.append(emailEntry);
        }
        if (this.contacts.github) {
            var githubEntry = $(contactGithubTemplate.replace(/%data%/g, this.contacts.github));

            contactContainer.append(githubEntry);
        }
        if (this.contacts.twitter) {
            var twitterEntry = $(contactTwitterTemplate.replace(/%data%/g, this.contacts.twitter));

            contactContainer.append(twitterEntry);
        }
        if (this.contacts.location) {
            var locationEntry = $(contactLocationTemplate.replace(/%data%/g, this.contacts.location));

            contactContainer.append(locationEntry);
        }
    }
};

var education = {
    schools: [{
            name: "Nice University of Wonderland",
            location: "Enchanted Kingdom",
            locationCoordinates: "32.302911, -64.751463",
            degree: "Bachelor",
            majors: [
                "Construction Enchantment",
                "Geomancy"
            ],
            dates: "01/2008 - 01/2012",
            url: "https://www.google.com.br"
        },
        {
            name: "Best University of Wonderland",
            location: "Enchanted Kingdom",
            locationCoordinates: "32.302911, -64.751463",
            degree: "Boss",
            majors: [
                "Secret Materials",
                "Dark Matter Transmutation"
            ],
            dates: "01/2012 - 01/2016",
            url: "https://www.google.com.br"
        }
    ],
    onlineCourses: [{
        title: "Curving space-time to improve efficiency",
        school: "Nice University of Wonderland",
        dates: "01/2016 - 01/2017",
        url: "https://www.google.com.br"
    }],
    display: function() {
        var schoolsFound = this.schools && (this.schools.length > 0);

        var onlineCoursesHeader = $('#education .online-classes');

        if (schoolsFound) {
            this.schools.forEach(function(element) {
                var educationEntry = $(
                    educationTemplate.replace(/%url%/g, element.url)
                    .replace(/%name%/g, element.name + ' - ' + element.degree)
                    .replace(/%date%/g, element.dates)
                    .replace(/%location%/g, element.location)
                    .replace(/%majors%/g, element.majors.join(', '))
                );

                educationEntry.insertBefore(onlineCoursesHeader);
            });
        }

        if (this.onlineCourses && (this.onlineCourses.length > 0)) {
            this.onlineCourses.forEach(function(element) {
                var onlineEducationEntry = $(
                    onlineEducationTemplate.replace(/%url%/g, element.url)
                    .replace(/%name%/g, element.title + ' - ' + element.school)
                    .replace(/%date%/g, element.dates)
                );

                onlineEducationEntry.insertAfter(onlineCoursesHeader);
            });
        } else if (!schoolsFound) {
            $('#education').hide();
        } else {
            onlineCoursesHeader.hide();
        }
    }
};

var work = {
    jobs: [{
        employer: "Rodent Corporation",
        title: "Builder",
        location: "HyperCuba",
        locationCoordinates: "23.067706, -82.351246",
        dates: "01/2017 - now",
        description: "I build magnificent office structures at paralelal dimensions for large companies."
    }],
    display: function() {
        var workExperienceSection = $('#work-experience');

        if (this.jobs && (this.jobs.length > 0)) {
            this.jobs.forEach(function(element) {
                var workEntry = $(
                    workExperienceTemplate.replace(/%url%/g, element.url)
                    .replace(/%name%/g, element.employer + ' - ' + element.title)
                    .replace(/%date%/g, element.dates)
                    .replace(/%location%/g, element.location)
                    .replace(/%description%/g, element.description)
                );

                workExperienceSection.append(workEntry);
            });
        } else {
            workExperienceSection.hide();
        }
    }
};

var projects = {
    projects: [{
        title: "Structure simulation to improve stability",
        dates: "02/2017 - 04/2017",
        description: "A simulation software that predicts wheater the structure will be stable or not.",
        images: [
            "img/project-image-1.svg",
            "img/project-image-2.jpg"
        ]
    }],
    display: function() {
        var projectsSection = $('#projects');

        if (this.projects && (this.projects.length > 0)) {
            this.projects.forEach(function(element) {
                var projectEntry = $(
                    projectTemplate.replace(/%name%/g, element.title)
                    .replace(/%date%/g, element.dates)
                    .replace(/%description%/g, element.description)
                );

                var projectImageContainer = projectEntry.find('.project-images');

                if (element.images && (element.images.length > 0)) {
                    element.images.forEach(function(imageURL) {
                        var projectImageEntry = $(projectImageTemplate.replace(/%url%/g, imageURL));

                        projectImageContainer.append(projectImageEntry);
                    });
                } else {
                    projectImageContainer.hide();
                }

                projectsSection.append(projectEntry);
            });
        } else {
            projectsSection.hide();
        }
    }
};

$('.owner-header .menu a').click(function(event) {
    event.preventDefault();

    var targetSection = $($(this).attr('href'));

    var headerHeight = $('.owner-header').css('height').replace('px', '');

    $('body').stop().animate({
            scrollTop: targetSection.position().top - headerHeight
        },
        500
    );
});

window.addEventListener('load', function() {
    bio.display();
    education.display();
    work.display();
    projects.display();

    $('#welcome').css('padding-top', $('.owner-header').css('height'));

    window.addEventListener('resize', function() {
        $('#welcome').css('padding-top', $('.owner-header').css('height'));
    });
});
