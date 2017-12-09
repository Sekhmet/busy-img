const getAvatarURL = (username, small = false) => {
  const size = (small) ? 64 : 128;
  switch (username.charCodeAt(0) % 10) {
    case 0: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5drQkCJrtNW2UJ6vUb2QJFGzesizcu_${size}x${size}`;
    case 1: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dsBRP49BF9M5FdChQYcrz2sEygN1F_${size}x${size}`;
    case 2: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dtiQDT29HaS1HTdFXNdHKcLL3TbdA_${size}x${size}`;
    case 3: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dsrAupu7M8t2rNRXqzszbiQzKr3HE_${size}x${size}`;
    case 4: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dsrVCxBQGNRj1hgtrubxSQvj6redg_${size}x${size}`;
    case 5: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5duEeDJxUqerVKadM7XXun2DEyfqWW_${size}x${size}`;
    case 6: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dsx9Kt4J7DxnF9TUoGRzmcF4BERt4_${size}x${size}`;
    case 7: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5ds1P874U1tWM9jtC37XNxTNxc8Dxf_${size}x${size}`;
    case 8: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dtuCEcc2F5B36fuGXSBfc4QHonQsD_${size}x${size}`;
    case 9: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dsAU5Q3Wt7WvNg9axvL7jnwp5T5qe_${size}x${size}`;
    default: return `https://steemit-production-imageproxy-thumbnail.s3.amazonaws.com/U5dtuCEcc2F5B36fuGXSBfc4QHonQsD_${size}x${size}`;
  }
};

module.exports = {
  getAvatarURL,
};
