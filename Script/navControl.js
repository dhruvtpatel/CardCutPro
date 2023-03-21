const gitJustin = 'https://github.com/ComradeDiamond';
const mailToJustin = 'mailto:JustinChen3946@gmail.com';

const editNav = (windowY, topNav) => {
	return windowY ? () => {
		topNav.classList.add("active");
	} : () => {
		topNav.classList.remove("active");
	}
}