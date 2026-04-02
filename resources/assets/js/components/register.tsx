import React from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import "../../css/bootstrap.min.css";
import "../../css/common.css";
import "../../css/main.css";
import "../../css/responsive.css";

// Images — adjust paths if needed
import shape1 from "../../images/shape1.svg";
import darkShape from "../../images/dark_shape.svg";
import shape2 from "../../images/shape2.svg";
import darkShape1 from "../../images/dark_shape1.svg";
import shape3 from "../../images/shape3.svg";
import darkShape2 from "../../images/dark_shape2.svg";
import registrationImg from "../../images/registration.png";
import registrationDarkImg from "../../images/registration1.png";
import logoImg from "../../images/logo.svg";
import googleImg from "../../images/google.svg";
import { registerUser } from "../auth";

const Register = ({ onLogin, onNavigateToLogin }) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");
    const [fieldErrors, setFieldErrors] =
        React.useState<Record<string, string>>({});

    const [form] = Form.useForm();
    const onFinish = async (values: {
        email: string;
        password: string;
        confirm: string;
        terms: boolean;
        first_name?: string;
        last_name?: string;
    }) => {
        setError("");
        setFieldErrors({});
        setLoading(true);

        try {
            const user = await registerUser(values);
            onLogin(user);
        } catch (err: any) {
            setLoading(false);
            // Log for debugging
            const responseData = err.errors;

            if (responseData) {

                const backendErrors = responseData;

                const fields = Object.keys(backendErrors).map((field) => ({
                    name: field,
                    errors: backendErrors[field], // array of messages
                }));

                form.setFields(fields); // <-- this shows messages under each respective field
            } else {
                // Generic error
                message.error(err.error.message || err.message || "Something went wrong!");
            }
        }
    };

    return (
        <section className="_social_registration_wrapper _layout_main_wrapper">
            {/* Shapes */}
            <div className="_shape_one">
                <img src={shape1} alt="" className="_shape_img" />
                <img src={darkShape} alt="" className="_dark_shape" />
            </div>

            <div className="_shape_two">
                <img src={shape2} alt="" className="_shape_img" />
                <img src={darkShape1} alt="" className="_dark_shape _dark_shape_opacity" />
            </div>

            <div className="_shape_three">
                <img src={shape3} alt="" className="_shape_img" />
                <img src={darkShape2} alt="" className="_dark_shape _dark_shape_opacity" />
            </div>

            {/* Main Container */}
            <div className="_social_registration_wrap">
                <div className="container">
                    <div className="row align-items-center">

                        {/* Left Side Image */}
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_registration_right">
                                <div className="_social_registration_right_image">
                                    <img src={registrationImg} alt="Registration Illustration" />
                                </div>
                                <div className="_social_registration_right_image_dark">
                                    <img src={registrationDarkImg} alt="Dark Registration Illustration" />
                                </div>
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_registration_content">

                                <div className="_social_registration_right_logo _mar_b28">
                                    <img src={logoImg} alt="Logo" className="_right_logo" />
                                </div>

                                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                                <h4 className="_social_registration_content_title _titl4 _mar_b50">
                                    Registration
                                </h4>

                                {/* Google button */}
                                <button type="button" className="_social_registration_content_btn _mar_b40">
                                    <img src={googleImg} alt="Google Register" className="_google_img" />
                                    <span>Register with Google</span>
                                </button>

                                <div className="_social_registration_content_bottom_txt _mar_b40">
                                    <span>Or</span>
                                </div>

                                {/* Registration Form */}
                                <Form form={form} layout="vertical" onFinish={onFinish} className="_social_registration_form">
                                    <Form.Item
                                        label="First Name"
                                        name="first_name"
                                        rules={[
                                            { required: true, message: "First name is required!" },
                                            { min: 3, message: "First name must be at least 3 characters" }
                                        ]}
                                    >
                                        <Input className="_social_login_input" size="large" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Last Name"
                                        name="last_name"
                                        rules={[
                                            { required: true, message: "Last name is required!" },
                                            { min: 3, message: "Last name must be at least 3 characters" }
                                        ]}
                                    >
                                        <Input className="_social_login_input" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: "Email is required!" },
                                            { type: "email", message: "Enter a valid email!" },
                                        ]}

                                    >
                                        <Input className="_social_registration_input" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[{ required: true, message: "Password is required!" }]}
                                    >
                                        <Input.Password className="_social_registration_input" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Repeat Password"
                                        name="password_confirmation"
                                        dependencies={["password"]}
                                        rules={[
                                            { required: true, message: "Confirm your password!" },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue("password") === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error("Passwords do not match!"));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password className="_social_registration_input" size="large" />
                                    </Form.Item>

                                    <Form.Item
                                        name="terms"
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                validator: (_, value) =>
                                                    value
                                                        ? Promise.resolve()
                                                        : Promise.reject("You must accept terms & conditions"),
                                            },
                                        ]}
                                    >
                                        <Checkbox>I agree to terms & conditions</Checkbox>
                                    </Form.Item>

                                    <Form.Item className="_mar_t40 _mar_b60">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="_social_registration_form_btn_link _btn1"
                                            loading={loading}
                                            block
                                            size="large"
                                        >
                                            Register Now
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <div className="_social_registration_bottom_txt">
                                    <p className="_social_registration_bottom_txt_para">
                                        Already have an account?{" "}
                                        <a href="" onClick={onNavigateToLogin}>
                                            Login now
                                        </a>
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;
