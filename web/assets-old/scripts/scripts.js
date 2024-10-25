 
const eventHandlers = function () {
    console.log($("[data-modal-close]"));
    $("[data-modal-close]").on("click", function () {
        $(".overlay").hide();
        $("body").removeAttr("style");
    });

    $(".nav-checkout, .nav-cart").on("click", function () {
        $(this).toggleClass("shown"); 

        if ($(this).hasClass("shown")) {
            $(".sidebar").show();
        } else {
            $(".sidebar").hide();
        }
    });

    $("[data-modal-open]").on("click", function () {
        const modal = $(this).attr("data-modal-open");
        console.log(modal);
        $(".cust-modal input, .modal select").val("");
        $(".overlay").css({ "display": "flex" });
        $(".overlay").removeClass("hidden");
        $(".cust-modal").hide();
        console.log($(`.cust-modal[data-modal="${modal}"]`))
        $(`.cust-modal[data-modal="${modal}"]`).show();
        $(`.cust-modal[data-modal="${modal}"]`).removeClass("hidden");
    });

    var header = document.getElementById("supplier-filter");

    if (header) {
        window.onscroll = function () { myFunction() };
        var sticky = header.offsetTop;

        function myFunction() {
            console.log(window.pageYOffset);
            if (window.pageYOffset > sticky) {
                header.classList.add("sticky");
            } else {
                header.classList.remove("sticky");
            }
        }
    }

    $(".dropdown-item").on("click", function () {

        if ($(this).hasClass("active")) {
            $(this).removeClass("active");
        } else {
            $(this).addClass("active");
        }
    });

    $(".add-qty").on("click", function () {
        const input = $(this).prev();
        const minQty = 2;
        let value = parseInt($(input).val());

        if (value === 0 && minQty > 0) {
            value = minQty;
        } else {
            value++;
        }

        $(input).val(value);
    });


    $(".minus-qty").on("click", function () {
        const input = $(this).next();
        let value = parseInt($(input).val());
        value--;

        if (value < 0) {
            value = 0;
        }

        $(input).val(value);
    });

    console.log($(".form-field-select"));
    $(".form-field-select").on("click", function () {
        $(this).find(".form-field-options").show();
    })

    $(".form-field-option").on("click", function () {
        const text = $(this).text().trim();
        const value = $(this).data("value").trim();
        const container = $(this).closest(".form-field");
        const parent = $(this).closest(".form-field-options");
        const input = $(container).find("input");

        $(input).val(text);
        $(input).attr("data-value", value);
        $(parent).hide();
    })

    $(".form-field-input[value]").closest(".form-field").addClass("with-value");

    $(".form-field-input").on("keypress", function () {
        console.log($(this));
        if($(this).val()) {
            $(this).closest(".form-field").addClass("with-value");
        } else {
            $(this).closest(".form-field").removeClass("with-value");
        }
    })
}

const showDialog = function (headerText, message, showConfirmBtn, showCancelBtn, confirmBtnText, cancelBtnText, icon, confirmBtnFunc) {
    $("[data-id='dialog-header']").text(headerText);
    $("[data-id='dialog-message']").text(message);
    $(".modal").hide();
    $(".dialog").show();
    $(".overlay").show();

    if (showConfirmBtn) {
        $(".dialog .confirm-btn").show();
    } else {
        $(".dialog .confirm-btn").hide();
    }

    if (showCancelBtn) {
        $(".dialog .cancel-btn").show();
    } else {
        $(".dialog .cancel-btn").hide();
    }

    if (confirmBtnText) {
        $(".dialog .confirm-btn").html(`<i class='bi bi-check-lg'></i> ${confirmBtnText}`);
    } else {
        $(".dialog .confirm-btn").html("<i class='bi bi-check-lg'></i> Confirm");
    }

    if (cancelBtnText) {
        $(".dialog .cancel-btn").text(cancelBtnText);
    } else {
        $(".dialog .cancel-btn").text("Cancel");
    }

    if (confirmBtnFunc) {
        $(".dialog .confirm-btn").on("click", confirmBtnFunc);
    }

    console.log($(".dialog"));
}

var progressBar = {
    Bar: $('#progress-bar'),
    Reset: function () {
        if (this.Bar) {
            this.Bar.find('li').removeClass('active');
        }
    },
    Next: function () {
        const currentStep = parseInt($(".question.active").attr("data-step-id"));
        const showStep = currentStep < 3 ? currentStep + 1 : currentStep;
        const question = $(`.question[data-step-id='${showStep}']`);
        const stepLabel = $(`.step[data-step-id='${showStep}']`);
        console.log(showStep);
        console.log($(".question.active"));
        $(".step.active").removeClass("active");
        $(stepLabel).addClass("active");
        $(".question.active").fadeOut("fast");
        $(".question.active").removeClass("active");

        setTimeout(() => {
            $(question).fadeIn("fast");
            $(question).addClass("active");
        }, 500);

        if(showStep > 1) {
            $("#Back").show();
        } else {
            $("#Back").hide();
        }

        if(showStep === 3) {
            $("#Submit").show();
            $("#Next").hide();
        } else {
            $("#Submit").hide();
            $("#Next").show();
        }
    },
    Back: function () {
        const currentStep = parseInt($(".question.active").attr("data-step-id"));
        const showStep = currentStep > 0 ? currentStep - 1 : currentStep;
        const question = $(`.question[data-step-id='${showStep}']`);
        const stepLabel = $(`.step[data-step-id='${showStep}']`);

        $(".step.active").removeClass("active");
        $(stepLabel).addClass("active");
        $(".question.active").fadeOut("fast");
        $(".question.active").removeClass("active");

        setTimeout(() => {
            $(question).fadeIn("fast");
            $(question).addClass("active");
        }, 500);

        if(showStep > 1) {
            $("#Back").show();
        } else {
            $("#Back").hide();
        }

        if(showStep === 3) {
            $("#Next").hide();
        } else {
            $("#Next").show();
        }
    }
}

progressBar.Reset();

$(document).ready(function () {
    eventHandlers();
});

