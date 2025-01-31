const e = require('connect-flash');
const monngoose = require('mongoose');
const {Schema} = monngoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        MissingPasswordError: 'パスワードが入力されていません',
        AttemptTooSoonError: 'アカウントが現在ロックされています。後でもう一度試してください',
        TooManyAttemptsError: 'ログイン試行が多すぎるため、アカウントがロックされました',
        NoSaltValueStoredError: '認証ができません。保存されたソルト値がありません',
        IncorrectPasswordError: 'パスワードまたはユーザー名が正しくありません',
        IncorrectUsernameError: 'パスワードまたはユーザー名が正しくありません',
        MissingUsernameError: 'ユーザー名が入力されていません',
        UserExistsError: 'そのユーザー名は既に使われています'
    }
});

module.exports = monngoose.model('User', UserSchema);