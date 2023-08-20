export const formatCourses = (courses) => {
    let formated = '';

    
    courses.forEach((course) => {
        formated += `
            <div class="account__container__list__item">
                <div class="account__container__list__item__back image--back" style="background-image: url('/assets/uploads/thumbnails/${course.thumbnail}'); "></div>
                <div class="account__container__list__item__details">
                    <h4 data-courseid="${course._id}" class="account__container__list__item__details_name">${course.name}</h4>
                    <p class="flex">
                        <span class="margin--right-2" onclick="">${course.videoCount} Video${course.videoCount == 1 ? '' : 's'}</span>
                        <span data-courseid="${course._id}" class="account__container__list__item__details__new-video">Add video</span>
                    </p>
                </div>
            </div>
        `    
    })

    return formated;
}

export const formatVideos = (videos) => {
    let formated = '';

    videos.forEach((video) => {
        formated += `
            <div class="account__container__list__item">
                <div class="account__container__list__item__back image--back" style="background-image: url('/assets/uploads/thumbnails/${video.thumbnail}'); "></div>
                <div class="account__container__list__item__details">
                    <h4 data-videoid="${video._id}" data-videouid="${video.uniqueId}" class="account__container__list__item__details_name">${video.name}</h4>
                </div>
            </div>
        `
    })

    return formated;
}

export const formatHomeVideos = (videos) => {
    let formated = '';

    videos.forEach(video => {
        formated += `
            <div class="video-list__video">
                <div class="video-list__video__thumbnail image--back"
                    style="background-image: url('/assets/uploads/thumbnails/${video.thumbnail}');">
                    <div class="video-list__video__thumbnail__video-metrics pos--abs flex flex--a-center flex--j-center">
                        <div class="flex">
                            <svg class="image--icon">
                                <use href="#eye"></use>
                            </svg>
                            <p>55 Views</p>
                        </div>
                        <div class="flex">
                            <svg class="image--icon">
                                <use href="#heart"></use>
                            </svg>
                            <p>23 Likes</p>
                        </div>
                    </div>
                </div>
                <div class="video-list__video__details flex">
                    <div class="video-list__video__details__photo margin--right-1">
                        <img class="pos--abs pos--center" src="/assets/uploads/profiles/default.svg" alt="profile">
                    </div>
                    <div class="video-list__video__details__right">
                        <p>${video.user.username} | ${video.course.name}</p>
                        <h4>${video.name}</h4>
                    </div>
                </div>
            </div>
        `
    });

    return formated;
}